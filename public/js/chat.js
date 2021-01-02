const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll = ()=>{
    //New Message Element
    const $newMessage = $messages.lastElementChild


    //Height of new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight =  $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far i have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight  <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log(newMessageMargin)

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        createdAt:moment(message.createdAt).format('h:mm A'),
        chatMessage:message.text
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationMessage',(location)=>{
    const html = Mustache.render(locationMessageTemplate,{
        username:location.username,
        createdAt:moment(location.createdAt).format('h:mm A'),
        mapURL:location.mapURL
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable until current request process
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message,(error)=>{
        //enable because current request already proccessed
        $messageFormButton.removeAttribute('disabled')

        // clear text field and set focus
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geo Location is not supported by your broswer.')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
       socket.emit('sendLocation',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

