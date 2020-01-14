const users = [];

// addUser
const addUser = ( { id, username, room } ) => {
    
    // Clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate data
    if(!username || !room) {
        return {
            error: 'username and room are required'
        };
    };

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    if(existingUser) {
        return {
            error: 'username is in use'
        };
    };

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
};

// removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index!==-1) {
        return users.splice(index, 1)[0];
    };
};

// getUser
const getUser = (id) => {
    const user = users.find((user) => user.id === id);
    return user;
};

// getUsersInRoom
const getUsersInRoom = (room) => {
    const roomUsers = users.filter((user) => user.room === room);
    return roomUsers;
};

// tests
addUser({id: 21, username: " sTeve", room: "hub"});
addUser({id: 22, username: " evan", room: "hub"});
addUser({id: 23, username: " bryle", room: "hub"});
addUser({id: 24, username: " chen", room: "hubs"});
console.log(getUser(22));
console.log(getUsersInRoom("hub"));

module.exports = 
{
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};