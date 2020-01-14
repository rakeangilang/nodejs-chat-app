const socket = io();

// Elements - $ sign is used as convention when storing element
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messageArea = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // new message element
    const $newMessage = $messageArea.lastElementChild;

    // new message height
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messageArea.offsetHeight;

    // Height of messages container
    const containerHeight = $messageArea.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messageArea.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messageArea.scrollTop = $messageArea.scrollHeight;
    };
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, // using shorthand
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    $messageArea.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(urlTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('HH:mm')
    });
    $messageArea.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('updateRoom', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // disable input
    $messageFormButton.setAttribute('disabled', 'disabled');

    const msg = document.querySelector('input').value;

    // Send message
    socket.emit('sendMessage', msg, (error) => {
        // enable input
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error) {
            console.log(error);
        }
        else {
            console.log("Message delivered!");
        }
    });
});

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Geolocation not supported by your browser');
    else {
        // disable
        $sendLocationButton.setAttribute('disabled', 'disabled');
        navigator.geolocation.getCurrentPosition((position) => {
            //console.log(position.coords);
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            
            // Send location
            socket.emit('sendLocation', {lat, long}, () => {
                // enable
                $sendLocationButton.removeAttribute('disabled');
                console.log("Location shared!");
            });
        });
    }
});

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    };
});