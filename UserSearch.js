$( document ).ready(function() {
    console.log( "ready!" );
    
    function createNode(element) {
      return document.createElement(element); // Create the type of element you pass in the parameters
    }

    function append(parent, el) {
      return parent.appendChild(el); // Append the second parameter(element) to the first one
    }

    /*Date and time format*/
    function formatAMPM(today) {
      var hours = today.getHours();
      var minutes = today.getMinutes();
      var ampm = hours >= 12 ? 'PM  ' : 'AM  ';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var strTime = date + ',' + hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

    /*set multiple attributes at once*/
    function setAttributes(el, attrs) {
      for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    }

    /*clear search input from search box*/
    $('.clearInput').on('click', function(){
        var searchStr = document.getElementById('searchStr').value;
        if(searchStr){
            document.getElementById('searchStr').value=" ";
        }
    });

    /*Clear all history from search results*/
    $('#clear-all').on('click', function () {
        var table = document.getElementById('searchResult'); 

        var child = table.lastElementChild;  
        while (child) { 
          table.removeChild(child); 
            child = table.lastElementChild; 
        } 
        //stop the default behaviour of the link
        return false;
    });

    /*Clear individual record from search results*/
    $("#searchResult").on('click','.delBtn',function(){
        $(this).parent().parent().remove();
    });

    /*search functionality based on input text from search-box*/
    function search(selectedVal){
      var table = document.getElementById('searchResult'); 
     
      var url = 'https://api.github.com/users/'+selectedVal; 
      var today = new Date();
      var dateTime = formatAMPM(today);
      fetch(url, {mode: 'cors'})
      .then((resp) => resp.json())  
      .then(function(data) {
          let tr = createNode('tr'), 
          td1 = createNode('td'),
          td2 = createNode('td'),
          time = createNode('time'),
          td3 = createNode('td'),
          inputBtn = createNode('input');
          td1.innerHTML = `${data.login}` ; 
          time.innerHTML = `${dateTime}`;
          setAttributes(tr, {"id":selectedVal});
          setAttributes(td2, {"style":"float:right;"});
          setAttributes(inputBtn, {"type": "image", "src": "cancel.png","class":"delBtn"});

          append(td2, time)
          append(td3, inputBtn);
          append(tr, td1);
          append(tr, td2);
          append(tr, td3);
          append(table, tr);
      })
      .catch(function(error) {
        console.log(error);
      });
    }
    
    /*get all users login*/
    function getLogin(){
      var arr = [];
      var url = 'https://api.github.com/users'; 
      var match ="login";
      fetch(url, {mode: 'cors'})
        .then((resp) => resp.json())  
        .then(function(data) {
          Object.keys(data).forEach(function (item) {
            var value=data[item];
            Object.keys(value).forEach(function (key) {
              if(key==="login"){
              // all values for 'login' keys
              arr.push(value[key]);
            }
            })
          });         
        })
        .catch(function(error) {
          console.log(error);
        });

        return arr;

    }

    /*An array containing all users login*/
    var users = getLogin();

    autocomplete(document.getElementById("searchStr"), users);

    /*the autocomplete function takes two arguments:
    the text field from search-box and an array of possible autocompleted values*/
    function autocomplete(inputStr, arr) {
        var currentFocus;

        /*execute a function if text is written on search-box*/
        inputStr.addEventListener("input", function(e) {
            closeAllLists();
            var val =this.value;
            if (!val) { return false;}
            currentFocus = -1;
            var a=document.createElement("article");
            a.setAttribute("id","autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                var b = document.createElement("article");
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                    inputStr.value = this.getElementsByTagName("input")[0].value;
                    console.log(inputStr.value);
                    /*Search for selected value*/
                    search(inputStr.value);
                    closeAllLists();
                });
                a.appendChild(b);
                }
            }
        });

        /*execute a function presses a key on the keyboard:*/
        inputStr.addEventListener("keydown", function(e) {
            var x = document.getElementById("autocomplete-list");
            if (x) x = x.getElementsByTagName("article");
            if (e.keyCode == 40) { //down
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) { //up
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) { //enter
                e.preventDefault();
                if (currentFocus > -1) {
                if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
        
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inputStr) {
                x[i].parentNode.removeChild(x[i]);
            }
            }
        }

        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

});