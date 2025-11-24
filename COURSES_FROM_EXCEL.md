# 📚 Course Data from Excel File

This project now uses **635 real courses** from the Excel file `מיפוי קורסי מטח1 (3).xlsx`!

## 🎯 What Was Done

1. **Converted Excel to TypeScript**: All 635 courses from your Excel file have been converted to a TypeScript data file
2. **Organized by Categories**: Courses are organized into 76 categories based on the "תחום" and "תת תחום" columns
3. **Integrated into App**: The CourseSelection component now uses this real data instead of the hardcoded sample

## 📊 Course Statistics

- **Total Courses**: 635
- **Total Categories**: 76
- **Source**: `מיפוי קורסי מטח1 (3).xlsx`

### Top Categories:
- אנגלית (English): 34 courses
- תנ"ך ממלכתי: 32 courses  
- מולדת גאוגרפיה וסביבה: 25 courses
- המומלצים (Recommended): 22 courses
- אוריינות דיגיטלית (Digital Literacy): 21 courses
- ...and 71 more categories!

## 🔄 How to Update Courses

If you need to update the course list from the Excel file:

### Option 1: Using npm script (Recommended)
```bash
npm run convert-courses
```

### Option 2: Direct node command
```bash
node scripts/convertExcelToCourses.js
```

This will:
1. Read the Excel file from `src/components/מיפוי קורסי מטח1 (3).xlsx`
2. Convert it to TypeScript format
3. Save it to `src/data/coursesData.ts`
4. Show you statistics about categories and courses

## 📁 File Structure

```
├── src/
│   ├── components/
│   │   ├── CourseSelection.tsx       # Uses the imported course data
│   │   └── מיפוי קורסי מטח1 (3).xlsx # Source Excel file
│   └── data/
│       └── coursesData.ts            # Generated course data (635 courses)
├── scripts/
│   └── convertExcelToCourses.js     # Conversion script
└── package.json                      # Added "convert-courses" script
```

## 🎨 Excel File Format

The script reads these columns from your Excel file:
- **שם יחידת הכוורת**: Course name
- **תחום**: Main domain/category  
- **תת תחום**: Sub-domain (combined with main domain for category name)

## ✨ Features

### Search & Filter
- Search through all 635 courses by name
- Filter by any of the 76 categories
- Real-time results as you type

### Course Categories Include:
- שפת אם (Hebrew/Arabic native language courses)
- אנגלית (English)
- מתמטיקה (Mathematics)
- מדע וטכנולוגיה (Science & Technology)
- היסטוריה (History)
- אומנויות (Arts)
- למידה חברתית רגשית SEL (Social-Emotional Learning)
- And 69 more specialized categories!

## 🚀 Quick Start

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Navigate to Course Selection**: The page will now show all 635 courses organized by categories

3. **Search and select**: Use the search bar and filter dropdown to find specific courses

4. **Continue**: Your selections are saved and used for personalized recommendations in the chat

## 🔧 Updating the Excel File

If you want to update the course list:

1. **Replace the Excel file** in `src/components/` with your new version (keep the same name)
2. **Run the conversion**:
   ```bash
   npm run convert-courses
   ```
3. **Restart the app**:
   ```bash
   npm start
   ```

The app will now use your updated course list!

## 📝 Notes

- Course IDs are auto-generated from course names with a unique index
- Empty rows in the Excel file are automatically skipped
- Categories are created by combining "תחום" and "תת תחום" fields
- The original Excel file is preserved and never modified

## 🎉 Result

You now have a fully functional course selection system with **635 real courses** from your Excel file, searchable and filterable by 76 different categories!
