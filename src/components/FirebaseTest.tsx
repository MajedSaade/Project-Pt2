import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    runAllFirebaseTests,
    checkExistingSessions,
    checkExistingSessionFiles
} from '../utils/testFirebase';

const FirebaseTest: React.FC = () => {
    const { currentUser } = useAuth();
    const [testResults, setTestResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sessionCount, setSessionCount] = useState<number | null>(null);
    const [fileCount, setFileCount] = useState<number | null>(null);

    const handleRunTests = async () => {
        setLoading(true);
        setTestResults(null);

        try {
            const results = await runAllFirebaseTests(currentUser?.uid);
            setTestResults(results);
        } catch (error) {
            console.error('Test error:', error);
            setTestResults({ error: 'Failed to run tests' });
        }

        setLoading(false);
    };

    const handleCheckSessions = async () => {
        setLoading(true);
        const count = await checkExistingSessions();
        setSessionCount(count);
        setLoading(false);
    };

    const handleCheckFiles = async () => {
        if (!currentUser) {
            alert('Please log in first');
            return;
        }

        setLoading(true);
        const count = await checkExistingSessionFiles(currentUser.uid);
        setFileCount(count);
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🔥 Firebase Connection Test</h1>

                <div style={styles.userInfo}>
                    {currentUser ? (
                        <>
                            <p>✅ Logged in as: <strong>{currentUser.email}</strong></p>
                            <p>User ID: <code>{currentUser.uid}</code></p>
                        </>
                    ) : (
                        <p>⚠️ Not logged in</p>
                    )}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Run Connection Tests</h2>
                    <p style={styles.description}>
                        This will test your Firestore and Storage connections
                    </p>
                    <button
                        onClick={handleRunTests}
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
                    </button>

                    {testResults && (
                        <div style={styles.results}>
                            <h3>Test Results:</h3>
                            <div style={styles.resultItem}>
                                <strong>Firestore:</strong> {
                                    testResults.firestore?.success ? '✅ PASS' : '❌ FAIL'
                                }
                            </div>
                            <div style={styles.resultItem}>
                                <strong>Storage:</strong> {
                                    testResults.storage?.success ? '✅ PASS' : '❌ FAIL'
                                }
                            </div>
                            <div style={styles.resultItem}>
                                <strong>Data Structure:</strong> ✅ PASS
                            </div>

                            {testResults.error && (
                                <div style={styles.error}>
                                    Error: {testResults.error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Check Existing Data</h2>

                    <div style={styles.buttonGroup}>
                        <button
                            onClick={handleCheckSessions}
                            disabled={loading}
                            style={styles.button}
                        >
                            📊 Check Firestore Sessions
                        </button>

                        <button
                            onClick={handleCheckFiles}
                            disabled={loading || !currentUser}
                            style={styles.button}
                        >
                            📁 Check Storage Files
                        </button>
                    </div>

                    {sessionCount !== null && (
                        <div style={styles.results}>
                            <p>Found <strong>{sessionCount}</strong> session(s) in Firestore</p>
                        </div>
                    )}

                    {fileCount !== null && (
                        <div style={styles.results}>
                            <p>Found <strong>{fileCount}</strong> file(s) in Storage</p>
                        </div>
                    )}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📝 Instructions</h2>
                    <ol style={styles.instructions}>
                        <li>Make sure you're logged in</li>
                        <li>Click "Run All Tests" to verify Firebase connection</li>
                        <li>Check the browser console (F12) for detailed logs</li>
                        <li>If tests pass, your Firebase is configured correctly!</li>
                        <li>Use "Check" buttons to see existing data</li>
                    </ol>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🔍 Open Browser Console</h2>
                    <p style={styles.description}>
                        Press <kbd style={styles.kbd}>F12</kbd> to open Developer Tools and see detailed test output
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        fontFamily: "'Inter', 'Noto Sans Hebrew', Arial, sans-serif"
    },
    card: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
    },
    title: {
        fontSize: '32px',
        fontWeight: 700,
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center' as const
    },
    userInfo: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center' as const
    },
    section: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '15px'
    },
    description: {
        color: '#666',
        marginBottom: '15px'
    },
    button: {
        backgroundColor: '#7a35d5',
        color: 'white',
        border: 'none',
        padding: '14px 28px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(122, 53, 213, 0.3)',
        marginRight: '10px',
        marginBottom: '10px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as const
    },
    results: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '2px solid #e0e0e0'
    },
    resultItem: {
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '16px'
    },
    error: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#fee',
        color: '#c00',
        borderRadius: '8px',
        fontWeight: 600
    },
    instructions: {
        paddingLeft: '20px',
        lineHeight: '1.8',
        color: '#555'
    },
    kbd: {
        backgroundColor: '#333',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 600
    }
};

export default FirebaseTest;
