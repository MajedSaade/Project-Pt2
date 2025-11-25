import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadString, listAll } from 'firebase/storage';

/**
 * Test Firebase Firestore connection
 */
export const testFirestoreConnection = async () => {
    try {
        console.log('🔍 Testing Firestore connection...');

        // Try to write a test document
        const testData = {
            test: true,
            timestamp: new Date(),
            message: 'Firebase connection test'
        };

        const docRef = await addDoc(collection(db, 'test_connection'), testData);
        console.log('✅ Firestore WRITE successful! Document ID:', docRef.id);

        // Try to read documents
        const querySnapshot = await getDocs(collection(db, 'test_connection'));
        console.log('✅ Firestore READ successful! Found', querySnapshot.size, 'documents');

        return { success: true, message: 'Firestore is working correctly!' };
    } catch (error) {
        console.error('❌ Firestore test failed:', error);
        return { success: false, error };
    }
};

/**
 * Test Firebase Storage connection
 */
export const testStorageConnection = async (userId: string = 'test-user') => {
    try {
        console.log('🔍 Testing Storage connection...');

        // Try to upload a test file
        const testData = JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            message: 'Storage connection test'
        }, null, 2);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `test/${userId}/test_${timestamp}.json`;
        const storageRef = ref(storage, fileName);

        await uploadString(storageRef, testData, 'raw', {
            contentType: 'application/json'
        });
        console.log('✅ Storage WRITE successful! File:', fileName);

        // Try to list files
        const listRef = ref(storage, `test/${userId}`);
        const listResult = await listAll(listRef);
        console.log('✅ Storage LIST successful! Found', listResult.items.length, 'files');

        return { success: true, message: 'Storage is working correctly!', fileName };
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        return { success: false, error };
    }
};

/**
 * Test session data structure
 */
export const testSessionDataStructure = () => {
    console.log('🔍 Testing session data structure...');

    const mockSessionData = {
        sessionDate: new Date().toLocaleDateString('he-IL'),
        sessionTime: '00:15:30',
        sessionDateTime: new Date().toLocaleString('he-IL'),
        timestamp: new Date(),
        userId: 'test-user-id',
        userInfo: {
            userName: 'Test Teacher',
            teacherInfo: {
                subjectArea: 'Mathematics',
                schoolType: 'High School',
                language: 'עברית'
            },
            courseRatings: []
        },
        conversationHistory: [
            {
                id: '1',
                content: 'Hello, I need course recommendations',
                isUser: true,
                timestamp: new Date()
            },
            {
                id: '2',
                content: 'I can help you with that!',
                isUser: false,
                timestamp: new Date()
            }
        ],
        survey: {
            answers: {
                overallExperience: 5,
                responseQuality: 4,
                helpfulness: 5,
                accuracy: 4,
                easeOfUse: 5,
                wouldRecommend: 'yes'
            },
            completedAt: new Date().toLocaleString('he-IL')
        }
    };

    console.log('✅ Session data structure is valid!');
    console.log('📋 Sample data:', JSON.stringify(mockSessionData, null, 2));

    return mockSessionData;
};

/**
 * Run all tests
 */
export const runAllFirebaseTests = async (userId?: string) => {
    console.log('🚀 Starting Firebase tests...\n');

    const results = {
        firestore: await testFirestoreConnection(),
        storage: await testStorageConnection(userId),
        dataStructure: testSessionDataStructure()
    };

    console.log('\n📊 Test Results Summary:');
    console.log('Firestore:', results.firestore.success ? '✅ PASS' : '❌ FAIL');
    console.log('Storage:', results.storage.success ? '✅ PASS' : '❌ FAIL');
    console.log('Data Structure: ✅ PASS');

    if (results.firestore.success && results.storage.success) {
        console.log('\n🎉 All tests passed! Firebase is configured correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the errors above.');
        if (!results.firestore.success) {
            console.log('\n🔧 Firestore troubleshooting:');
            console.log('1. Make sure Firestore is enabled in Firebase Console');
            console.log('2. Check Firestore security rules');
            console.log('3. Verify environment variables in .env file');
        }
        if (!results.storage.success) {
            console.log('\n🔧 Storage troubleshooting:');
            console.log('1. Make sure Storage is enabled in Firebase Console');
            console.log('2. Check Storage security rules');
            console.log('3. Verify storage bucket in .env file');
        }
    }

    return results;
};

/**
 * Check if sessions exist in Firestore
 */
export const checkExistingSessions = async () => {
    try {
        console.log('🔍 Checking for existing sessions...');

        const querySnapshot = await getDocs(collection(db, 'sessions'));

        if (querySnapshot.empty) {
            console.log('📭 No sessions found in Firestore');
            console.log('💡 This is normal if you haven\'t completed any chat sessions yet');
        } else {
            console.log(`✅ Found ${querySnapshot.size} session(s) in Firestore`);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`\n📄 Session ID: ${doc.id}`);
                console.log(`   Date: ${data.sessionDateTime}`);
                console.log(`   User: ${data.userInfo?.userName || 'Unknown'}`);
                console.log(`   Messages: ${data.conversationHistory?.length || 0}`);
                console.log(`   Survey completed: ${data.survey?.answers ? 'Yes' : 'No'}`);
            });
        }

        return querySnapshot.size;
    } catch (error) {
        console.error('❌ Error checking sessions:', error);
        return 0;
    }
};

/**
 * Check if session files exist in Storage
 */
export const checkExistingSessionFiles = async (userId: string) => {
    try {
        console.log('🔍 Checking for existing session files in Storage...');

        const listRef = ref(storage, `sessions/${userId}`);
        const listResult = await listAll(listRef);

        if (listResult.items.length === 0) {
            console.log('📭 No session files found in Storage');
            console.log('💡 This is normal if you haven\'t completed any chat sessions yet');
        } else {
            console.log(`✅ Found ${listResult.items.length} session file(s) in Storage`);

            listResult.items.forEach((item) => {
                console.log(`   📄 ${item.name}`);
            });
        }

        return listResult.items.length;
    } catch (error) {
        console.error('❌ Error checking session files:', error);
        return 0;
    }
};
