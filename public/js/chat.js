const socket = io() 

//Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');
const $locationMessages = document.querySelector('#locationMessages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options


const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix:true
} )

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHieght = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight;
    
    //Height of messsages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHieght <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message',(message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll();

})

socket.on('locationMessage',(locationMessage) => {
    console.log(locationMessage);
    const html = Mustache.render(locationMessageTemplate,{
        username:locationMessage.username,
        locationMessage:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format('h:mm a')
    })
    $locationMessages.insertAdjacentHTML('beforeend',html)

    autoscroll();


})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})



$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled')

    //disable
    const message = document.querySelector('input').value

    socket.emit('sendMessage',message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error);
        }
        
        console.log("Delivered");
    })
})

$sendLocationButton.addEventListener('click',(e)=>{

    if(!navigator.geolocation){
        return alert('Gelocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
       
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location shared");
        })
    })
    

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})