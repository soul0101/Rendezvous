import recalculateLayout from './layoutHandler.js';
const socket = io('/');
const peers = {};
let selfId;

// ----Peer---- //
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/', //local host or heroku etc
    port: 3000
});

peer.on('open', (id) => {
    selfId = id;
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    console.log('connectnig to new user: ' + userId);
    const call = peer.call(userId, stream);
    const peerVideo = document.createElement('video');
    call.on('stream', (peerVideoStream) => {
        addVideoStream(peerVideo, peerVideoStream);
    });
    call.on('close', () => {
        peerVideo.remove();
    });

    peers[userId] = call;
};

// ----Web-Cam Input---- //

let videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
let myVideoStream;

myVideo.muted = true;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
    }
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
});

peer.on('call', (call) => {
    call.answer(myVideoStream);
    const peerVideo = document.createElement('video');
    call.on('stream', (peerVideoStream) => {
        addVideoStream(peerVideo, peerVideoStream);
    });
    call.on('close', () => {
        peerVideo.remove();
    });

    peers[call.peer] = call; //call.peer = id of caller
});

socket.on('user-connected', (userId) => {
    setTimeout(() => {
        // user joined
        connectToNewUser(userId, myVideoStream)
    }, 1000);
});

const addVideoStream = (video, stream) => {
    console.log('adding video..')
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
    recalculateLayout();
};


$(document).keyup((e) => {
    let msg = $('#chat-input');
    if(e.which == 13 && msg.val().length !== 0){
        socket.emit('chatMessage', selfId, msg.val());
        msg.val('');
    }
});

socket.on('create-message', (senderId, message) => {
    $("ul").append(`<li class="message"><b>${senderId}</b><br/>${message}</li>`);
    scrollToBottom();
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close();
    console.log('closing connection of user: userId');
    recalculateLayout();
});

const scrollToBottom = () => {
    let d = $('.main-chat-window');
    d.scrollTop(d.prop('scrollHeight'));
}

const toggleAudio = () => {
    let enabled = myVideoStream.getAudioTracks()[0].enabled;

    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        $('#mic-icon').text('mic_off');
    }
    else{
        myVideoStream.getAudioTracks()[0].enabled = true;
        $('#mic-icon').text('mic');
    }
};

const toggleVideo = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        $('#cam-icon').text('videocam_off');
    }
    else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        $('#cam-icon').text('videocam');
    }
};

$('#mute-button').on('click', toggleAudio);
$('#video-button').on('click', toggleVideo);

$('#leave-meeting-button').on('click', () => {
    console.log('Leaving...');
    socket.disconnect();
    window.location.href = '/bye';
});

$('#chat-button').on('click', () => {
    if ($('.main-right').is(':hidden')) {
        $('.main-right').show();
        $('#chat-screen').show();
        $('#participants-screen').hide();
    }
    else {
        if ($('#chat-screen').is(':hidden')){
            $('#chat-screen').show();
            $('#participants-screen').hide();
        }
        else{
            $('.main-right').hide();
        }
    }
});

$('#participants-button').on('click', () => {
    if ($('.main-right').is(':hidden')) {
        $('.main-right').show();
        $('#chat-screen').hide();
        $('#participants-screen').show();
    }
    else {
        if ($('#participants-screen').is(':hidden')){
            $('#chat-screen').hide();
            $('#participants-screen').show();
        }
        else{
            $('.main-right').hide();
        }
    }
});

let resizeObserver = new ResizeObserver(recalculateLayout);
resizeObserver.observe($('.main-video')[0]);