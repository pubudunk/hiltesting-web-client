import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const tests = [
    { id: '01', name: 'GPIO Output Test' },
    { id: '02', name: 'GPIO Input/Output Test' },
    { id: '03', name: 'UART Test' },
    { id: '04', name: 'I2C Test' },
    { id: '05', name: 'CAN Test' }
];

function App() {
    const [selectedTests, setSelectedTests] = useState(tests.map(test => ({ ...test, selected: true })));
    const [results, setResults] = useState([]);
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
            name: test.name
        }));

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
                                    <td>{result.result}</td>
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
