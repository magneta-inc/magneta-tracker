setTimeout(function(magneta) {
  //Init Vars
  let conversionDest;
  let paramsObj;
  let campaignLink;
  let dbUrl;

  /****************UTIL FUNCTIONS***************/
  //getRGBA
  const getRGBA = ({ r, g, b, a }) => {
    return `rgba(${r},${g},${b},${a})`;
  };
  //Cookies Functions
  const CookiesUtil = {
    setCookie: function(cname, cval, expDays) {
      const d = new Date();
      d.setTime(d.getTime() + expDays * 24 * 60 * 60 * 1000);
      const expires = `expires = ${d.toUTCString()}`;
      document.cookie = `${cname}= ${cval}; ${expires}; path=/`;
    },
    getCookie: function(cname) {
      const name = cname + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const CookieArr = decodedCookie.split(";");
      for (let i = 0; i < CookieArr.length; i++) {
        let c = CookieArr[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
  };

  //uurl -- takes location.href
  //gets the URL params and returns a paramsObj
  const getUrlParams = uurl => {
    let paramsObj = {};
    let params = uurl.split("?")[1];
    if (params) {
      params = params.split("#")[0];
      const paramsArr = params.split("&");
      for (let i = 0; i < paramsArr.length; i++) {
        let utmCombo = paramsArr[i];
        let utmArr = utmCombo.split("=");
        let tempObj = { [utmArr[0]]: utmArr[1] };
        paramsObj = {
          ...paramsObj,
          ...tempObj
        };
      }
    }
    return paramsObj;
  };

  /****************UTIL FUNCTIONS END ***************/

  //getLandingInfo
  //Params Index(index of campagin), channel (name of influencer) , userId(userId of company), dbUrl(databaseUrl)
  async function getLanding(index, channel, userId, dbUrl) {
    let landing;
    const url =
      dbUrl + "/getLandingInfo/" + index + "/" + channel + "/" + userId;
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        landing = JSON.parse(xmlHttp.responseText);
        console.log(landing);
        initLandingPage({ ...landing }, index, userId);
      }
    };

    xmlHttp.send(null);
  }

  //initizlaize the landing Page to be presented
  function initLandingPage(
    {
      isPrimaryGradient,
      isSecondaryGradient,
      primaryColor1,
      primaryColor2,
      secondaryColor1,
      secondaryColor2,
      headlineColor,
      secondaryHeadlineColor,
      subHeaderColor,
      headline,
      secondaryHeadline,
      subHeader,
      promoCode
    },
    index,
    userId
  ) {
    //appending the css to the head
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://codepen.io/bradsmith2015/pen/oNNVgvp.css";
    head.appendChild(link);
    //Init All Vars for the template string
    const primaryColor1rgb = getRGBA({
      ...primaryColor1
    });
    const primaryColor2rgb = getRGBA({
      ...primaryColor2
    });
    const primaryBg = isPrimaryGradient
      ? `linear-gradient(45deg,${primaryColor1rgb} 0%, ${primaryColor2rgb} 100%)`
      : primaryColor1rgb;
    const secondaryColor1rgb = getRGBA({
      ...secondaryColor1
    });
    const secondaryColor2rgb = getRGBA({
      ...secondaryColor2
    });
    const secondaryBg = isSecondaryGradient
      ? `linear-gradient(45deg,${secondaryColor1rgb} 0%, ${secondaryColor2rgb} 100%)`
      : secondaryColor1rgb;
    const secondaryHeadlineColorRgb = getRGBA({
      ...secondaryHeadlineColor
    });
    const headlineColorRgb = getRGBA({
      ...headlineColor
    });
    const subHeaderColorRgb = getRGBA({
      ...subHeaderColor
    });
    let emailReceived = false;

    /***********Pop Up Basic Template String************/
    const PopUpBasic = `
    <div class="overlayPopup">
        <div class="PopUpContainerNoImg">
            <button
            id="closePopup"
            class="close">
            <svg
                role="button"
                fill="gray"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                id="close"
            >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
            </button>
            <div 
                class="PopUpContent PopUpContent-L"
                style="background:${primaryBg};"
            >
                <h1
                    style="color:${headlineColorRgb};"
                >
                    ${headline}
                </h1>
            </div>
            <div
                class="PopUpContent PopUpContent-R"
                style="background:${secondaryBg};"
            >
                <div>
                    <h1
                        style="color:${secondaryHeadlineColorRgb}"
                    >
                        ${secondaryHeadline}
                    </h1>
                    <h2
                        style="color:${subHeaderColorRgb}"
                    >
                        ${subHeader}

                    </h2>
                </div>
                <div id="promoHolder" class="PromoHolder2">
                
                </div>
            
            </div>
        </div>
    </div>
    `;
    /***********Pop Up Basic Template String************/

    //Loading PopUp onto Page
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="loadMagnetaDiv"></div>'
    );
    let loadMagnetaDiv = document.getElementById("loadMagnetaDiv");
    loadMagnetaDiv.insertAdjacentHTML("beforeend", PopUpBasic);

    //function render
    //params template (a template string or template function(for conditional renders)) , selector the id of the element to select for rendering
    var render = function(template, selector) {
      var node = document.querySelector(selector);
      if (!node) return;
      node.innerHTML = typeof template === "function" ? template() : template;
    };
    //Promo template
    let promoTemplate = function() {
      if (emailReceived) {
        return `<input readonly class="PromoEmail2" id="promoCodeMag" value=${promoCode} /><button class="submitButton2" id="copyButton" style="background:${primaryBg};color:${headlineColor}">Copy</button>`;
      } else {
        return `<input class="PromoEmail2" type="email" id="promoEmailMag" placeholder="Enter your email here"/><button class="submitButton2" id="submitbutton"  style="background:${primaryBg};color:${headlineColor}" >Submit</button>`;
      }
    };
    render(promoTemplate, "#promoHolder");

    //Submit Button function
    if (!emailReceived) {
      let submitbutton = document.getElementById("submitbutton");
      submitbutton.onclick = function(e) {
        const email = document.getElementById("promoEmailMag").value;
        if (email.indexOf("@") === -1) {
          alert("This is not a valid email");
        } else {
          const xmlHttp = new XMLHttpRequest();
          xmlHttp.open("POST", `${dbUrl}/addEmail/${index}/${userId}`);
          xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
              let res = JSON.parse(xmlHttp.responseText);
              if (res.success) {
                emailReceived = true;
                render(promoTemplate, "#promoHolder");
                //Copy Button function
                //This function works based of the value of the input from promoTemplate input
                let copyButton = document.getElementById("copyButton");
                copyButton.onclick = function() {
                  if (!window.navigator.clipboard) {
                    fallbackCopyTextToClipboard(promoCode);
                    console.log(promoCode);
                    return;
                  }
                  window.navigator.clipboard.writeText(promoCode).then(
                    function() {
                      console.log(
                        "Async: Copying to clipboard was successful!"
                      );
                    },
                    function(err) {
                      console.error("Async: Could not copy text: ", err);
                    }
                  );
                };
              }
            }
          };
          xmlHttp.send(JSON.stringify({ email: email }));
        }
      };
    } else {
    }
    const fallbackCopyTextToClipboard = text => {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
        textArea.remove();
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
    };

    //CLOSE BUTTON FUNCTION TO CLOSE THE POPUP
    let closeButton = document.getElementById("closePopup");
    closeButton.onclick = function() {
      var elem = document.querySelector("#loadMagnetaDiv");
      elem.parentNode.removeChild(elem);
      CookiesUtil.setCookie("magneta.seen", true);
    };
  }

  //Initialize tracker
  function initTracker() {
    paramsObj = getUrlParams(window.location.href);
    //Check if magneta is in the params object and
    if (paramsObj.magneta) {
      console.log(paramsObj);
      const { utm_MagChannel, utm_MagIndex, utm_MagId } = paramsObj;
      dbUrl = paramsObj.testing
        ? "http://localhost:4000/users"
        : "https://magneta-mvp.herokuapp.com/users";

      if (CookiesUtil.getCookie("magneta.userId")) {
        //setting the onLoad method for magneta
      } else {
        //set UserId with a random string
        CookiesUtil.setCookie(
          "magneta.userId",
          Math.random()
            .toString(36)
            .substr(2, 9),
          30
        );
        CookiesUtil.setCookie("magneta.channel", utm_MagChannel, 30);
        CookiesUtil.setCookie("magneta.campaign", utm_MagIndex, 30);
        CookiesUtil.setCookie("magneta.id", utm_MagId, 30);
      }
      const url = dbUrl + "/getConvInfo/" + utm_MagId + "/" + utm_MagIndex;
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", url, true);
      xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          let res = JSON.parse(xmlHttp.responseText);
          conversionDest = res.conversionDest;
          campaignLink = res.campaignLink;
          let currentPath =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname;
          console.log(currentPath, campaignLink);
          if (
            currentPath === campaignLink &&
            !CookiesUtil.getCookie("magneta.seen")
          ) {
            const url = `${dbUrl}/updateClicks/${utm_MagIndex}/${utm_MagChannel}/${utm_MagId}`;
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.open("POST", url);
            xmlHttp.send(null);
            getLanding(utm_MagIndex, utm_MagChannel, utm_MagId, dbUrl);
          }
        }
      };
      xmlHttp.send(null);
    }
  }
  initTracker();
  //onload check if the path is equal to the coversion path
  window.onload = () => {
    if (CookiesUtil.getCookie("magneta.userId")) {
      const currentPath = window.location.pathname;
      const campaign = CookiesUtil.getCookie("magneta.campaign");
      const userId = CookiesUtil.getCookie("magneta.id");
      const channel = CookiesUtil.getCookie("magneta.channel");
      dbUrl = "https://magneta-mvp.herokuapp.com/users";
      const url = `${dbUrl}/getConvInfo/${userId}/${campaign}`;
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", url, true);
      console.log("test");
      xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          let res = JSON.parse(xmlHttp.responseText);
          conversionDest = res.conversionDest;
          console.log(conversionDest);
          if (
            (currentPath === conversionDest ||
              currentPath === `/${conversionDest}`) &&
            CookiesUtil.getCookie("magneta.userId")
          ) {
            console.log("conversion");
            if (campaign && userId && channel) {
              const conversionReq =
                dbUrl +
                "/updateConversions/" +
                campaign +
                "/" +
                channel +
                "/" +
                userId;

              const xmlHttp = new XMLHttpRequest();
              xmlHttp.open("POST", conversionReq, true);
              xmlHttp.send(null);
            }
          }
        }
      };
      xmlHttp.send(null);
    }
  };
}, 100);
