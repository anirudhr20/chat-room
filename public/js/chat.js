var socket = io();

function scrollToBottom(){
    //selectors,heights
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight>=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}


socket.on('connect',function (){
    //console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join',params,function(err){
        if(err){
            alert(err);
            window.location.href = '/'
        }else{
            console.log('No error');
        }
    })
});

socket.on('disconnect',function (){
    console.log('Disconnected from server')
});


socket.on('updateUserList',function(users){
    var ol =jQuery('<ol></ol>');
    users.forEach(function(user){
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
})

socket.on('newMessage',function(message){
    var formattedTime = moment(message.createAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html =Mustache.render(template,{
        text:message.text,
        from:message.from,
        createAt:formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
    //console.log('New Message',message);
    
    /*var li = jQuery('<li></li>');
    li.text(`${message.from}: ${formattedTime}:${message.text}`);

    jQuery('#messages').append(li);*/
});

socket.on('newLocationMessage',function(message){
    var formattedTime = moment(message.createAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template,{
        from:message.from,
        url:message.url,
        createAt:formattedTime
    });

    jQuery('#messages').append(html);
    
    scrollToBottom();
    
    /*var li= jQuery('<li></li>');
    var a = jQuery('<a target="_blank">My current location</a>');
    
    li.text(`${message.from}:${formattedTime}`);
    a.attr('href',message.url);

    li.append(a);
    jQuery('#messages').append(li);*/
})

jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextBox = jQuery('[name="message"]');
    socket.emit('createMessage',{
        text:messageTextBox.val()
    },function(){
        messageTextBox.val('');
    });
});

var locationButton = jQuery('#send-location');

locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supprted')
    }

    locationButton.attr('disabled','disabled').text('Sending location ...');

    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        });
    },function(){
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location');
    })
});