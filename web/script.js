const PAGE_EMPTY = 1
const PAGE_LOGIN = 2
const PAGE_REGISTER = 3
const PAGE_MAIN_CONTNET = 5

let map = null
let marker = null

let state = {
    username: "",
    loggedIn: false,
    page: PAGE_EMPTY,
    token: "",
    displayMap: false,
    lookupResult: {},
}

const SetState = (next = {}) => {
    let prev = JSON.parse(JSON.stringify(state))
    state = { ...state, ...next }

    if (state.username !== prev.username || state.loggedIn !== prev.loggedIn || state.token !== prev.token){
        RenderNavBar()
    }

    if(state.page !== prev.page || state.token !== prev.token) {
        RenderMainContent()
    }

    if (state.displayMap !== prev.displayMap || state.lookupResult !== prev.lookupResult) {
        RenderMap()
        RenderLookupResult()
    }
}

// RENDER NAV BAR CONTENT //
const RenderEmptyUserNavBar = () => `
    <a class="nav-item nav-link active" href="#" id="login" onclick="OnClickNavLogin()">Login</a>
    <a class="nav-item nav-link active" href="#" id="register" onclick="OnClickNavRegister()">Register</a>
`

const RenderUserNavBar = () => `
    <a class="nav-item nav-link active" href="#" id="username" onclick="OnClickNavUserName()">Hello! ${state.username}</a>
    <a class="nav-item nav-link active" href="#" id="logout" onclick="OnClickNavLogout()">Logout</a>
`

const RenderNavBar = () => {
    $("#nav-bar-container").empty()

    if (!state.loggedIn) {
        $("#nav-bar-container").append(RenderEmptyUserNavBar())
        return
    }

    $("#nav-bar-container").append(RenderUserNavBar())
}
// RENDER NAV BAR CONTENT //

// RENDER MAIN BODY CONTENT //
const RenderEmptyMainContent = () => `Please login first`

const RenderLoginMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-login-username">Username</span>
        </div>
        <input id="input-login-username" type="text" class="form-control" aria-label="Small"
            aria-describedby="inputGroup-sizing-sm-login-username">
    </div>

    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-login-password">Password</span>
        </div>
        <input id="input-login-password" type="text" class="form-control" aria-label="Small"
            aria-describedby="inputGroup-sizing-sm-login-password">
    </div>

    <button class="btn btn-primary" onclick="OnClickLogin()">Login</button>
`

const RenderRegisterMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-register-username">Username</span>
        </div>

        <input id="input-register-username" type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm-register-username">
    </div>

    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-register-password">Password</span>
        </div>
        <input id="input-register-password" type="text" class="form-control" aria-label="Small"aria-describedby="inputGroup-sizing-sm-register-password">
    </div>

    <button class="btn btn-primary" onclick="OnClickRegister()">Register</button>
`

const RenderUserMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-main-ip">IP Address</span>
        </div>
        <input id="input-main-ip" type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm-main-ip">
        <div class="input-group-append">
            <button class="btn btn-primary" onclick="OnClickLookup()">Look Up</button>
        </div>
    </div>
`

const RenderMainContent = () => {
    $("#main-content-container").empty()
    
    switch (state.page) {
        case PAGE_LOGIN: {
            $("#main-content-container").append(RenderLoginMainContent())
            break;
        }
        case PAGE_EMPTY: {
            $("#main-content-container").append(RenderEmptyMainContent())
            break;
        }
        case PAGE_REGISTER: {
            $("#main-content-container").append(RenderRegisterMainContent())
            break;
        }
        case PAGE_MAIN_CONTNET: {
            $("#main-content-container").append(RenderUserMainContent())
            break;
        }
    }
}

const RenderMap = () => {
    if (!state.displayMap) {
        $("#map").addClass("d-none")
        return
    }

    $("#map").removeClass("d-none")

    if (marker !== null) {
        map.removeLayer(marker)
    }

    marker = L.marker([state.lookupResult.latitude, state.lookupResult.longitude])

    // map.setView(new L.latLng(state.lookupResult.latitude, state.lookupResult.longitude), 13)
    marker.addTo(map)
    map.setView(new L.latLng(state.lookupResult.latitude, state.lookupResult.longitude), 13, {Animation: true})
}

const RenderLookupResult = () => {
    if (!state.displayMap) {
        return
    }

    $("#lookup-result").empty()

    const lookupResult = `

    `

    $("#lookup-result").append(lookupResult)
}
// RENDER MAIN BODY CONTENT //

// ON CLICK HANDLERES // 
const OnClickNavLogin = () =>  {
    if (state.loggedIn) {
        return
    }

    SetState({ 
        page: PAGE_LOGIN, 
        displayMap: false,
    })
}

const OnClickNavLogout = () => {
    if (!state.loggedIn) {
        return
    }
    SetState({
        username: "",
        loggedIn: false, 
        page: PAGE_EMPTY,
        token: "",
        displayMap: false,
    })
    window.alert("logged out")
}

const OnClickNavRegister = () => {
    if (state.loggedIn) {
        return
    }

    SetState({ 
        page: PAGE_REGISTER, 
        displayMap: false
    })
}   

const OnClickNavUserName = () => {
    if (state.loggedIn) {
        return
    }
}

const Login = (username = "", password = "") => fetch("http://localhost:8080/login", {
    method: "POST", 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    })
})

const Register = (username = "", password = "") => fetch("http://localhost:8080/register", {
    method: "POST", 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    })
})

const Lookup = (ip = "", token = "") => fetch(`http://localhost:8080/lookup?ip=${ip}`, {
    method: "GET", 
    headers: { 'Authorization': `Bearer ${token}` },
}) 

const OnClickLogin = () => {
    const username = $("#input-login-username").val()
    const password = $("#input-login-password").val()

    Login(username, password)
        .then(res => res.json())
        .then(res => {
            console.log(res)

            if (res.error) {
                window.alert(res.error)
                return
            }

            window.alert("success")
            SetState({
                username: res.username,
                loggedIn: true, 
                page: PAGE_MAIN_CONTNET,
                token: res.token,
                displayMap: false
            })
            
        })
        .catch(err => {
            window.alert(err)
        })
}

const OnClickRegister = () => {
    const username = $("#input-register-username").val()
    const password = $("#input-register-password").val()

    Register(username, password)
        .then(res => res.json())
        .then(res => {
            console.log(res)

            if (res.error) {
                window.alert(res.error)
                return
            }

            window.alert("success")

            SetState({
                username: res.username,
                loggedIn: true, 
                page: PAGE_MAIN_CONTNET,
                token: res.token,
                displayMap: false
            })
        })
        .catch(err => {
            window.alert(err)
        })
}

const OnClickLookup  = () => {
    console.log("OnClickLookup")
    const ip = $("#input-main-ip").val()

    Lookup(ip, state.token)
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                window.alert(res.error)
                return
            }

            SetState({ 
                displayMap: true,
                lookupResult: res,
            })
        })
        .catch(err => {
            window.alert(err)
        })
}

const InitMap = () => {
    map = L.map('map')

    const tileLayerOpt = {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
    }

    const tileProviderUrl = 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=QRZ2cgOgvBPajWKG2V3r'

    L.tileLayer(tileProviderUrl, tileLayerOpt).addTo(map)
}

// ON CLICK HANDLERES // 
$(document).ready(() => {
    InitMap()
    RenderNavBar()
    RenderMainContent()
    RenderMap()
})