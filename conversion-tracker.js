const dbURL = 'https://magneta-mvp.herokuapp.com/users'
let userId;
let campaign;
let landing;

const getUrlParams = () => {
    const uurl = window.location.href;
    let paramsObj = {};
    let params = uurl.split('?')[1];
    if (params) {
        params = params.split('#')[0];
        const paramsArr = params.split('&');
        for (let i = 0; i < paramsArr.length; i++) {
            let utmCombo = paramsArr[i]
            let utmArr = utmCombo.split('=');
            let tempObj = { [utmArr[0]]: utmArr[1] }
            paramsObj = {
                ...paramsObj,
                ...tempObj
            };
        }

    }
    return paramsObj;
};

function setCookieObj(cobj, expDays) {
    //set time to how many days to expire
    const d = new Date();
    d.setTime(d.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = `expires = ${d.toUTCString()}`;
    //Takes cookie object and then makes it a cookie
    Object.keys(cobj).map((key) => {
        document.cookie = `${key}= ${cobj[key]}; ${expires}; path=/;`
        return null;
    });
}

function setCoookie(cname, cval, expDays) {
    const d = new Date();
    d.setTime(d.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = `expires = ${d.toUTCString()}`;
    document.cookie = `${cname}= ${cval}; ${expires}; path=/`;
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const CookieArr = decodedCookie.split(';');
    for (let i = 0; i < CookieArr.length; i++) {
        let c = CookieArr[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }

    }
    return "";
}

function initTracker() {
    userId = getCookie("userId");

    let paramsObj = getUrlParams();

    // check if userId has already been tracked as well
    if (!userId) {

        if(paramsObj.MagnetaVerification) {
            console.log("verifying magneta conversion tracker...")
            window.alert("You have successfully installed magneta's conservion tracking software. Please close this tab and continue the sign up process.")
        }

        if(!paramsObj.userId) {
            console.log("nothing for us to do...")
            return;
        } else {
            userId = paramsObj.userId;
        }

        setCookieObj(paramsObj, 30);
    }

    // Get campaign info
    getCampaign(userId);

    waitForCampaign();
}

function Track() {
    let paramsObj = getUrlParams();

    // send to database as a click to the site
    const clickReq = dbURL + '/updateClicks/' + paramsObj.campaign + '/' + paramsObj.channel + '/' + userId
    postReq(clickReq, null)
    // check database if equal to or begins with
    let begins = campaign.campaigns[paramsObj.campaign].destCond
    // get request for get conversion location
    const conLoc = campaign.campaigns[paramsObj.campaign].conversionDest;
    let winLocation = window.location.pathname;

    // Check if page constitutes a conversion
    if (winLocation.includes(conLoc)) {
        console.log("conversion")
        //send to the database that there was conversions
        const convReq = dbURL + '/updateConversions/' + paramsObj.campaign + '/' + paramsObj.channel + '/' + userId
        postReq(convReq)
    }
}

function getCampaign(userId) {
    const url = dbURL + '/' + userId
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = () => {
      campaign = JSON.parse(xmlHttp.responseText)
    }
    xmlHttp.send(null);
}

function waitForCampaign(){
    if(typeof(campaign) !== "undefined"){
        Track();
    }
    else{
        setTimeout(waitForCampaign, 250);
    }
}

function getLandingInfo(index, channel, userId) {
    const url = dbURL + '/getLandingInfo/' + index + '/' + channel + '/' + userId
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = () => {
      landing = JSON.parse(xmlHttp.responseText)
    }
    xmlHttp.send(null);
}

function waitForLanding() {
    if(typeof(landing) !== "undefined"){
        showLanding();
    }
    else{
        setTimeout(waitForLanding, 250);
    }
}

function postReq(reqURL, reqBody) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", reqURL, true);
    xmlHttp.send(reqBody);
}

function closeIFrame() {
    var i = document.getElementById('greetFrame')
    i.parentNode.removeChild(i)
    var cls = document.getElementById('closeBtn')
    cls.parentNode.removeChild(cls)
}

function showLanding() {
    let paramsObj = getUrlParams();

    var ifrm = document.createElement('iframe');
    var closeBtn = document.createElement('button')
    var srcString = '<html><body style="background:' + landing[0] + ';">Hello fans of <b>' + decodeURI(paramsObj.channel) + '</b> ' + landing[1] +  '</body></html>';

    ifrm.setAttribute('srcdoc', srcString);
    ifrm.setAttribute('id', 'greetFrame')
    ifrm.setAttribute('style', 'height:200px;position:absolute;top:100px;left:40%;');

    closeBtn.onclick = closeIFrame;
    closeBtn.innerHTML = "close"
    closeBtn.setAttribute('id', 'closeBtn')
    closeBtn.style = "position:absolute; left:60%; top:100px;"

    document.body.appendChild(ifrm)
    document.body.appendChild(closeBtn)
}

function checkLanding() {
    let paramsObj = getUrlParams();

    if(paramsObj.landing) {
        getLandingInfo(paramsObj.campaign,decodeURI(paramsObj.channel), userId);
        waitForLanding();
    }
}

initTracker();
window.onload = checkLanding
