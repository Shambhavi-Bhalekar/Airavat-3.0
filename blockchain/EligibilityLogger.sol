// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EligibilityLogger
 * @dev Implements Pillar 05: Immutable Logging of AI Bail Eligibility Assessments
 */
contract EligibilityLogger {
    struct AssessmentLog {
        string caseId;
        string dataSources;
        string reasoningChain;
        uint8 confidenceLevel; // 0-100
        string paralegalResponse; // e.g., "Acted On", "Overrode", "Flagged"
        uint256 timestamp;
        address loggedBy;
    }

    // Maps a unique case ID to its assessment logs (allows tracking history over time)
    mapping(string => AssessmentLog[]) public caseLogs;
    
    // An array to keep track of all case IDs that have been logged
    string[] public allLoggedCases;

    event LogCreated(
        string indexed caseId,
        uint8 confidenceLevel,
        string paralegalResponse,
        uint256 timestamp
    );

    /**
     * @dev Write an immutable log for a specific case assessment.
     */
    function logAssessment(
        string memory _caseId,
        string memory _dataSources,
        string memory _reasoningChain,
        uint8 _confidenceLevel,
        string memory _paralegalResponse
    ) public {
        // If this is the first time this case is logged, add it to our tracking array
        if (caseLogs[_caseId].length == 0) {
            allLoggedCases.push(_caseId);
        }

        AssessmentLog memory newLog = AssessmentLog({
            caseId: _caseId,
            dataSources: _dataSources,
            reasoningChain: _reasoningChain,
            confidenceLevel: _confidenceLevel,
            paralegalResponse: _paralegalResponse,
            timestamp: block.timestamp,
            loggedBy: msg.sender
        });

        caseLogs[_caseId].push(newLog);

        emit LogCreated(_caseId, _confidenceLevel, _paralegalResponse, block.timestamp);
    }

    /**
     * @dev Retrieves the total number of updates a specific case has had.
     */
    function getLogCount(string memory _caseId) public view returns (uint256) {
        return caseLogs[_caseId].length;
    }

    /**
     * @dev Retrieves a specific log entry for a case by index.
     */
    function getLog(string memory _caseId, uint256 index) public view returns (
        string memory dataSources,
        string memory reasoningChain,
        uint8 confidenceLevel,
        string memory paralegalResponse,
        uint256 timestamp,
        address loggedBy
    ) {
        require(index < caseLogs[_caseId].length, "Log index out of bounds");
        AssessmentLog memory l = caseLogs[_caseId][index];
        return (l.dataSources, l.reasoningChain, l.confidenceLevel, l.paralegalResponse, l.timestamp, l.loggedBy);
    }
}
