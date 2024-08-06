import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const tests = [
    { id: 1, len: 0, data: 0, name: 'GPIO Output Test' },
    { id: 2, len: 0, data: 0, name: 'GPIO Input/Output Test' },
    { id: 3, len: 0, data: 0, name: 'UART Test' },
    { id: 4, len: 0, data: 0, name: 'I2C Test' },
    { id: 5, len: 0, data: 0, name: 'CAN Test' }
];

const replyCodes = ["Pass", "Fail", "N/A"];

function App() {
    const [selectedTests, setSelectedTests] = useState(tests.map(test => ({ ...test, selected: true })));
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('wss://e6fpx914z2.execute-api.us-east-1.amazonaws.com/production/');

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setResults(Array.isArray(data.results) ? data.results : []);
        };

        return () => {
            ws.current.close();
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const selectedTestsPayload = selectedTests.filter(test => test.selected).map(test => ({
            id: test.id,
            len: test.len,
            data: test.data,
            name: test.name
        }));

        if (selectedTestsPayload.length === 0) {
          setErrorMessage('Error: No tests selected.');
          return;
        }

        // Clear error message if there are selected tests
        setErrorMessage('');

        // Send JSON via WebSocket
        if (ws.current) {
            console.log(JSON.stringify({ action: 'sendTestCases', tests: selectedTestsPayload }));
            ws.current.send(JSON.stringify({ action: 'sendTestCases', tests: selectedTestsPayload }));
        }
    };

    const handleCheckboxChange = (index) => {
        const newSelectedTests = [...selectedTests];
        newSelectedTests[index].selected = !newSelectedTests[index].selected;
        setSelectedTests(newSelectedTests);

        // Clear error message if a test is selected
        if (newSelectedTests.some(test => test.selected)) {
          setErrorMessage('');
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Hardware-In-Loop Testing Configuration</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit}>
                    <h2>Select Tests</h2>
                    <div className="checkbox-container">
                        {selectedTests.map((test, index) => (
                            <label key={test.id}>
                                <input
                                    type="checkbox"
                                    checked={test.selected}
                                    onChange={() => handleCheckboxChange(index)}
                                />
                                {`${test.id} ${test.name}`}
                            </label>
                        ))}
                    </div>
                    <button type="submit">Execute</button>
                </form>
                {errorMessage && (
                    <div className="error-banner">
                        {errorMessage}
                    </div>
                )}
                {Array.isArray(results) && results.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Test ID</th>
                                <th>Test Name</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => (
                                <tr key={result.id}>
                                    <td>{result.id}</td>
                                    <td>{result.name}</td>
                                    <td>{replyCodes[result.result - 1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
            <footer>
                <p>© 2024 HIL Tester</p>
            </footer>
        </div>
    );
}

export default App;
