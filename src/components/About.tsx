import { useState, useEffect, useRef } from "react";
import { FaQuestionCircle } from "react-icons/fa";

function About() {
    const [isAboutVisible, setIsAboutVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Function to toggle the modal
    const toggleAbout = () => setIsAboutVisible(!isAboutVisible);

    // Close modal if clicking outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsAboutVisible(false);
            }
        }
        if (isAboutVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isAboutVisible]);

    return (
        <>
            {/* About Button */}
            <button onClick={toggleAbout} className="text-gray-600 hover:text-indigo-600 flex items-center space-x-2 mt-4" aria-label="About">
                <FaQuestionCircle className="text-xl" />
                <span>About</span>
            </button>

            {/* About Modal */}
            {isAboutVisible && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white p-8 rounded-lg shadow-2xl max-w-xl w-full space-y-6 text-gray-800 transform transition-all duration-300 ease-in-out scale-105"
                    >
                        <h2 className="text-3xl font-bold text-indigo-600">How to Use This Application</h2>
                        <p className="text-gray-500">
                            Welcome to the GitHub Repo Commit Stats tool! This application enables you to monitor and save commit data for multiple GitHub
                            repositories. Follow these instructions to get started:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-500">
                            <li>
                                <strong>Add Repositories:</strong> Enter GitHub URLs in the input field, each on a new line. Valid URLs have the format:{" "}
                                <em>https://github.com/owner/repo</em>
                            </li>
                            <li>
                                <strong>Load Data:</strong> Click "Add Repositories" to load commit data. You can add up to 30 repositories in one session.
                            </li>
                            <li>
                                <strong>Save Collections:</strong> Name your set of repositories and click "Save Collection" to store it. You can load or delete
                                saved collections as needed.
                            </li>
                            <li>
                                <strong>View Commit Details:</strong> Commit data includes weekly contributions for each repository. Use the "Show More" option to
                                see all repositories.
                            </li>
                            <li>
                                <strong>Weekly Comparison:</strong> The bottom section shows a comparative analysis of weekly commits across all loaded
                                repositories.
                            </li>
                            <li>
                                <strong>Performance Notes:</strong> Loading data from many repositories may take a few seconds, depending on GitHub’s response
                                times.
                            </li>
                        </ul>
                        <button
                            onClick={toggleAbout}
                            className="mt-4 px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default About;
