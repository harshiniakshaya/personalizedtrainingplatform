import React, { useState, useEffect, useContext, useRef } from 'react';
import { DataContext } from '../../context/DataContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FaTimes, FaCamera } from 'react-icons/fa';

// Register the necessary components for Chart.js to render a line chart.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * A modal that displays a detailed progress report for a single student within a specific course.
 * It includes a performance chart and a list of all quiz attempts.
 * @param {object} props - The component's props.
 * @param {object} props.student - The student object for whom the report is generated.
 * @param {object} props.course - The course context for the report.
 * @param {Function} props.onClose - Callback function to close the modal.
 */
const StudentReportModal = ({ student, course, onClose }) => {
    // Access the data-fetching function from the global context.
    const { fetchStudentReport } = useContext(DataContext);
    
    // State to store the fetched report data.
    const [report, setReport] = useState(null);
    // State to manage the loading UI while fetching the report.
    const [loading, setLoading] = useState(true);
    // A ref to get direct access to the Chart.js canvas element for downloading.
    const chartRef = useRef(null);

    // Effect to fetch the student's report when the modal is opened.
    useEffect(() => {
        const loadReport = async () => {
            const reportData = await fetchStudentReport(student._id, course._id);
            setReport(reportData);
            setLoading(false);
        };
        loadReport();
    }, [student, course, fetchStudentReport]); // Dependencies ensure this refetches if props change.

    /**
     * Downloads the chart canvas as a PNG image.
     * Uses the chart's instance method to generate a base64 image and triggers a download.
     */
    const handleDownloadChart = () => {
        const chart = chartRef.current;
        if (chart) {
            // Get the image data URL from the canvas.
            const imageUrl = chart.toBase64Image('image/png', 1); // Use quality 1 for high resolution.
            // Create a temporary anchor element to trigger the download.
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `chart_${student.name}_${course.title}.png`; // Set the filename.
            document.body.appendChild(link);
            link.click(); // Programmatically click the link to start the download.
            document.body.removeChild(link); // Clean up by removing the link.
        }
    };

    // Prepare the data structure required by the Chart.js <Line> component.
    const chartData = {
        labels: report?.attempts.map(a => a.quiz.title) || [],
        datasets: [{
            label: 'Score (%)',
            data: report?.attempts.map(a => (a.score / a.quiz.questions.length) * 100) || [],
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            tension: 0.1
        }],
    };

    // Configure the appearance and behavior of the Chart.js chart.
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Quiz Scores Over Time' }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    // Custom callback to format the Y-axis labels as percentages.
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col">
                {/* Modal Header with actions */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Student Progress Report</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleDownloadChart} className="flex items-center text-sm bg-blue-600 text-white py-2 px-3 rounded-md font-medium hover:bg-blue-700">
                            <FaCamera className="mr-2"/> Download Chart
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
                    </div>
                </div>

                {/* Scrollable Modal Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {loading ? <p className="text-center py-10">Loading report...</p> : report ? (
                        <div>
                            {/* Student and Course Information Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">{report.student.name}</h3>
                                <p className="text-md text-gray-500">{report.student.email}</p>
                                <p className="mt-2 text-lg font-semibold">Course: <span className="font-normal">{report.course.title}</span></p>
                            </div>
                            
                            {/* Performance Chart Section */}
                            <div className="mb-8">
                                <h4 className="text-xl font-bold mb-3 text-gray-800">Performance Chart</h4>
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    {/* The ref is attached here to give us direct access to the chart instance. */}
                                    <Line ref={chartRef} data={chartData} options={chartOptions}/>
                                </div>
                            </div>

                            {/* Detailed List of Quiz Attempts */}
                            <div>
                                <h4 className="text-xl font-bold mb-3 text-gray-800">Attempt Details</h4>
                                <div className="space-y-3">
                                    {report.attempts.map(attempt => (
                                        <div key={attempt._id} className="border rounded-lg p-4 flex justify-between items-center bg-white">
                                            <h5 className="font-semibold">{attempt.quiz.title}</h5>
                                            <p className="font-bold text-blue-600 text-lg">{attempt.score} / {attempt.quiz.questions.length}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : <p className="text-center py-10">Could not load report.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentReportModal;