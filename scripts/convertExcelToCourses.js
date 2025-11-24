const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelFilePath = path.join(__dirname, '../src/components/מיפוי קורסי מטח1 (3).xlsx');
const workbook = XLSX.readFile(excelFilePath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('First row sample:', data[0]);
console.log('Column names:', Object.keys(data[0] || {}));

// Organize courses by category
const courseCategories = {};

data.forEach((row, index) => {
  // Use the correct column names from the Excel file
  const courseName = row['שם יחידת הכוורת']; // Unit Name
  const mainDomain = row['תחום']; // Main domain (e.g., "שפת אם")
  const subDomain = row['תת תחום']; // Sub domain (e.g., "עברית")
  const language = row['שפת הקורס']; // Language of the course
  
  if (!courseName) {
    return; // Skip rows without course name
  }

  // Create category from main domain and sub domain
  let categoryName = mainDomain || 'כללי';
  if (subDomain && subDomain !== mainDomain && mainDomain) {
    categoryName = `${mainDomain} - ${subDomain}`;
  } else if (subDomain && !mainDomain) {
    categoryName = `כללי - ${subDomain}`;
  }
  
  // Create course ID from name
  const courseId = courseName
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9\s]/g, '') // Keep Hebrew, English, numbers
    .replace(/\s+/g, '-')
    .substring(0, 50) + `-${index}`;

  // Initialize category if it doesn't exist
  if (!courseCategories[categoryName]) {
    courseCategories[categoryName] = [];
  }

  // Add course to category
  courseCategories[categoryName].push({
    id: courseId,
    name: courseName,
    category: categoryName,
    language: language || 'עברית' // Default to Hebrew if not specified
  });
});

// Generate the TypeScript/JavaScript code
const outputPath = path.join(__dirname, '../src/data/coursesData.ts');

let tsContent = `// Auto-generated from מיפוי קורסי מטח1 (3).xlsx
// Total courses: ${data.length}
// Generated on: ${new Date().toISOString()}

export interface Course {
  id: string;
  name: string;
  category: string;
  language: string;
}

export interface CourseCategories {
  [category: string]: Course[];
}

export const coursesData: CourseCategories = ${JSON.stringify(courseCategories, null, 2)};

// Get all categories
export const categories = Object.keys(coursesData);

// Get total course count
export const totalCourses = ${data.length};
`;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write the file
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log('\n✅ Conversion complete!');
console.log(`📁 Output file: ${outputPath}`);
console.log(`📊 Total courses: ${data.length}`);
console.log(`📚 Total categories: ${Object.keys(courseCategories).length}`);
console.log('\nCategories found:');
Object.entries(courseCategories).forEach(([category, courses]) => {
  console.log(`  - ${category}: ${courses.length} courses`);
});
