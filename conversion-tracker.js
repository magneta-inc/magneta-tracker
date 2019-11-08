
let dbURL;
let userId;
let campaign;
let landing;
let paramsObj;

//Main Function: starts the tracker
function initTracker() {

    paramsObj = getUrlParams();
    userId = paramsObj.userId;
    //Check if in testing mode or not and change dbURL
    if (!(Object.entries(paramsObj).length === 0 && paramsObj.constructor === Object)) {
        console.log('this didnt work')
        if (paramsObj.testing) {
            dbURL = 'http://localhost:4000/users';

        } else {
            dbURL = 'https://magneta-mvp.herokuapp.com/users';
        }
        //Check if in verification mode and verify user
        if (paramsObj.userId && paramsObj.MagnetaVerification) {
            console.log(paramsObj.userId, paramsObj.MagnetaVerification)
            console.log("verifying magneta conversion tracker...")
            Verify(paramsObj.userId);
        }
        if (paramsObj.userId && !(paramsObj.MagnetaVerification)) {
            console.log('running');
            // Get campaign info
            getCampaign(paramsObj.userId);
            waitForCampaign();
        }
    }
}


//Gets Campaign Info
function getCampaign(userId) {
    const url = dbURL + '/' + userId
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            campaign = JSON.parse(xmlHttp.responseText)
            console.log(campaign);
        }
    }
    xmlHttp.send(null);
}
//Function to Verify if magneta is installed
function Verify(userId) {
    const url = dbURL + '/verify/' + userId;
    console.log(url);
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url, false);
    xmlHttp.onreadystatechange = () => {
        console.log(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.send(null);
    console.log('running verify');


}

//UTIL Functions
//gets the URL params and returns a paramsObj
const getUrlParams = () => {
    const uurl = location.href;
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

//
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




function waitForCampaign() {
    if (typeof (campaign) !== "undefined") {
        Track();
    }
    else {
        setTimeout(waitForCampaign, 250);
    }
} function Track() {
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





function getLandingInfo(index, channel, userId) {
    const url = dbURL + '/getLandingInfo/' + index + '/' + channel + '/' + userId
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            landing = JSON.parse(xmlHttp.responseText)
        }
    }
    xmlHttp.send(null);
}

function waitForLanding() {
    if (typeof (landing) !== "undefined") {
        showLanding();
    }
    else {
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
    var ifrm = document.createElement('iframe');
    var closeBtn = document.createElement('button')
    var srcString = '';
    var hasProf = (landing.profilePicUrl === null) ? false : true
    var profPicString = ``
    var iframHeight = 358

    if (hasProf) {
        profPicString = `<img style="border-radius: 50%;" src="` + landing.profilePicUrl + `" />`
        console.log("has profile pic is true = ", profPicString)
        console.log(landing)
        // Change IFrame height if there is a profile pic

        iframHeight = 508
    }

    if (landing.promoCode) {
        console.log("promo code active");
        srcString = `
            <html>
            <body style="z-index:16777271; font-family:Arial, Helvetica, sans-serif; ">
            <script>
                function getCopied() {
                    navigator.clipboard.writeText(`+ landing.promoCode + `);
                }
            </script>

            <div style="width: 600px; text-align: center; background: ` + landing.landingBg + `;">
                    <div
                    style="padding: 2rem 0rem;  color:black; font-size: 1.25rem">
                      <h1>Welcome ` + decodeURI(paramsObj.channel) + ` fans</h1>
                    </div>
                    ` + profPicString + `
                    <div
                    style="padding: 1rem 0rem; color:#4a5568; background: #edf2f7; ">
                      <h3>Use the promo code below to get ` + landing.promoDiscount + ` off <br/> ` + landing.landingAddTxt + `</h3>
                      <div
                      style="display: flex; width:16rem; padding: 1rem 0rem; margin: 0px auto;">
                        <div
                        style="border-radius: 2px 0px 0px 2px; background: #fff; padding: .5rem .5rem; width:12rem; text-align:left; font-size:1rem;">
                        </div>
                        <button
                          onclick="getCopied()"
                          style="border:none; color:white; font-size:.75rem; background: ` + landing.landingBg + `; padding: .5rem .25rem; width:4rem; border-radius: 0px 2px 2px 0px;"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
               </body>
            </html>`
    } else {
        console.log("promo code inactive");
        srcString = `
        <html>
          <body style="z-index:16777271; font-family:Arial, Helvetica, sans-serif; ">
              <div style="width: 600px; text-align:center; background: ` + landing.landingBg + `;">
                  <div
                      style="padding: 1rem 0rem;  color:black; font-size: 1.25rem">
                      <h1>Welcome `+ decodeURI(paramsObj.channel) + `fans</h1>
                      ` + profPicString + `
                      <p style="width:300px; height:auto; margin: 0rem auto; word-wrap: break-word; padding: 2rem 0rem;  color:black; font-size: 1rem;" >`+ landing.landingAddTxt + `}</p>
                  </div>
              </div>
          </body>
        </html>`
    }

    ifrm.setAttribute('srcdoc', srcString);
    ifrm.setAttribute('id', 'greetFrame')
    ifrm.setAttribute('style', 'z-index:16777271; border-style:none;width:617px;height:' + iframHeight + 'px;position:absolute;top:100px;left:25%; overflow:hidden;');

    closeBtn.onclick = closeIFrame;
    closeBtn.innerHTML = "close"
    closeBtn.setAttribute('id', 'closeBtn')
    closeBtn.style = "z-index:16777271; position:absolute; left:25.52%; top:107px"

    document.body.appendChild(ifrm)
    document.body.appendChild(closeBtn)
}
//Pull up Landing Page
function checkLanding() {
    paramsObj = getUrlParams();

    if (paramsObj.landing) {
        getLandingInfo(paramsObj.campaign, decodeURI(paramsObj.channel), userId);
        waitForLanding();
    }
}




initTracker();
window.onload = checkLanding
