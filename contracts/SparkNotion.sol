// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Web3Notion {
    struct Note {
        string id;
        string title;
        string content;
        string[] attachments; // CIDs of attachments
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Task {
        string id;
        string title;
        string description;
        bool completed;
        string status; // For Kanban: "todo", "in-progress", "done"
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct User {
        bool exists;
        string[] noteIds;
        string[] taskIds;
    }

    mapping(address => User) private users;
    mapping(address => mapping(string => Note)) private notes;
    mapping(address => mapping(string => Task)) private tasks;

    event NoteCreated(address indexed user, string id);
    event NoteUpdated(address indexed user, string id);
    event NoteDeleted(address indexed user, string id);
    event TaskCreated(address indexed user, string id);
    event TaskUpdated(address indexed user, string id);
    event TaskDeleted(address indexed user, string id);

    modifier onlyRegistered() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }

    function register() external {
        require(!users[msg.sender].exists, "User already registered");
        users[msg.sender].exists = true;
    }

    function createNote(string calldata id, string calldata title, string calldata content) external onlyRegistered {
        Note storage note = notes[msg.sender][id];
        note.id = id;
        note.title = title;
        note.content = content;
        note.createdAt = block.timestamp;
        note.updatedAt = block.timestamp;
        
        users[msg.sender].noteIds.push(id);
        
        emit NoteCreated(msg.sender, id);
    }

    function updateNote(string calldata id, string calldata title, string calldata content) external onlyRegistered {
        require(bytes(notes[msg.sender][id].id).length > 0, "Note does not exist");
        
        Note storage note = notes[msg.sender][id];
        note.title = title;
        note.content = content;
        note.updatedAt = block.timestamp;
        
        emit NoteUpdated(msg.sender, id);
    }

    function addAttachmentToNote(string calldata noteId, string calldata attachmentCid) external onlyRegistered {
        require(bytes(notes[msg.sender][noteId].id).length > 0, "Note does not exist");
        
        notes[msg.sender][noteId].attachments.push(attachmentCid);
        notes[msg.sender][noteId].updatedAt = block.timestamp;
        
        emit NoteUpdated(msg.sender, noteId);
    }

    function deleteNote(string calldata id) external onlyRegistered {
        require(bytes(notes[msg.sender][id].id).length > 0, "Note does not exist");
        
        // Find and remove the note ID from the user's noteIds array
        string[] storage noteIds = users[msg.sender].noteIds;
        for (uint i = 0; i < noteIds.length; i++) {
            if (keccak256(bytes(noteIds[i])) == keccak256(bytes(id))) {
                // Move the last element to the position of the element to delete
                noteIds[i] = noteIds[noteIds.length - 1];
                // Remove the last element
                noteIds.pop();
                break;
            }
        }
        
        delete notes[msg.sender][id];
        
        emit NoteDeleted(msg.sender, id);
    }

    function createTask(string calldata id, string calldata title, string calldata description, string calldata status) external onlyRegistered {
        Task storage task = tasks[msg.sender][id];
        task.id = id;
        task.title = title;
        task.description = description;
        task.completed = false;
        task.status = status;
        task.createdAt = block.timestamp;
        task.updatedAt = block.timestamp;
        
        users[msg.sender].taskIds.push(id);
        
        emit TaskCreated(msg.sender, id);
    }

    function updateTask(string calldata id, string calldata title, string calldata description, bool completed, string calldata status) external onlyRegistered {
        require(bytes(tasks[msg.sender][id].id).length > 0, "Task does not exist");
        
        Task storage task = tasks[msg.sender][id];
        task.title = title;
        task.description = description;
        task.completed = completed;
        task.status = status;
        task.updatedAt = block.timestamp;
        
        emit TaskUpdated(msg.sender, id);
    }

    function deleteTask(string calldata id) external onlyRegistered {
        require(bytes(tasks[msg.sender][id].id).length > 0, "Task does not exist");
        
        // Find and remove the task ID from the user's taskIds array
        string[] storage taskIds = users[msg.sender].taskIds;
        for (uint i = 0; i < taskIds.length; i++) {
            if (keccak256(bytes(taskIds[i])) == keccak256(bytes(id))) {
                // Move the last element to the position of the element to delete
                taskIds[i] = taskIds[taskIds.length - 1];
                // Remove the last element
                taskIds.pop();
                break;
            }
        }
        
        delete tasks[msg.sender][id];
        
        emit TaskDeleted(msg.sender, id);
    }

    function getNoteIds() external view onlyRegistered returns (string[] memory) {
        return users[msg.sender].noteIds;
    }

    function getTaskIds() external view onlyRegistered returns (string[] memory) {
        return users[msg.sender].taskIds;
    }

    function getNote(string calldata id) external view onlyRegistered returns (string memory, string memory, string memory, string[] memory, uint256, uint256) {
        Note storage note = notes[msg.sender][id];
        require(bytes(note.id).length > 0, "Note does not exist");
        
        return (note.id, note.title, note.content, note.attachments, note.createdAt, note.updatedAt);
    }

    function getTask(string calldata id) external view onlyRegistered returns (string memory, string memory, string memory, bool, string memory, uint256, uint256) {
        Task storage task = tasks[msg.sender][id];
        require(bytes(task.id).length > 0, "Task does not exist");
        
        return (task.id, task.title, task.description, task.completed, task.status, task.createdAt, task.updatedAt);
    }
}
