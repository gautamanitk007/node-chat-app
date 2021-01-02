
const generateMessage = (username,message)=>{
    return {
        username:username,
        text:message,
        createdAt:new Date().getTime()
    }
}

const generateLocation = (username,mapURL)=>{
    return {
        username:username,
        mapURL:mapURL,
        createdAt:new Date().getTime()
    }
}

module.exports ={ generateMessage,generateLocation}