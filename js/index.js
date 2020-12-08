(function() {
  
  var firebaseConfig = { /** firebase config */ };
  
  firebase.initializeApp(firebaseConfig);
  
  var current_user = "";
  var words = [];
  var current_word = {};

  var page = document.querySelector("body").getAttribute("page");
  var signoutBtn = document.getElementById("signout");
  var sendToFirebase = document.getElementById("sendToFirebase");
  
  var randomArray = [];
  var randomLimit = 7;
  for (var i = 1; i <= randomLimit; i++) {
    for (var j = 1; j <= i; j++) {
      randomArray.push(i);
    }
  }
  
  function addWord(firebase) {
    var mainWord = document.getElementById("mainWord").value;
    var meaningWord = document.getElementById("meaningWord").value;
  
    firebase.database().ref().child("users").child(current_user).child("word").push(
      {
        mainWord : mainWord,
        meaningWord : meaningWord,
        degree : 5
      }
    ).then(() => {
      confirm("Kelime Başarıyla eklendi...");
    });
  
    document.getElementById("mainWord").value = "";
    document.getElementById("meaningWord").value = "";
  }
  
  
  function listWords(firebase) {
    var wordRef = firebase.database().ref().child("users/" + current_user).child("word");
    wordRef.on("value", function(snapshot){
      var words = document.querySelector(".Content-words");
  
      document.querySelectorAll(".Content-words-word[data-key]").forEach(function(item) {
        item.parentNode.removeChild(item);
      });
  
      snapshot.forEach(function(item){
        words.appendChild(document.querySelector(".Content-words-word[prototype]").cloneNode(true));
        var el = document.querySelector(".Content-words-word:last-of-type");
        el.querySelector(".Content-words-word-1 span").innerHTML = item.val().mainWord;
        el.querySelector(".Content-words-word-3 span").innerHTML = item.val().meaningWord;
        el.removeAttribute("prototype");
        el.setAttribute("data-key", item.key);
        deleteEvent(firebase, document.querySelector(".Content-words-word[data-key="+item.key+"]"));
      })
  
    });
  }
  
  function deleteWord(firebase, key) {
    firebase.database().ref("users/" + current_user).child("word").child(key).remove();
  }
  
  function deleteEvent(firebase, el) {
    el.children[3].addEventListener("click", function() {
      var key = el.getAttribute("data-key");
      deleteWord(firebase, key);
    });
  }
  
  function getWord() {
    var degree = randomArray[Math.floor(Math.random() * randomArray.length)];
    
    var filter_words = words.filter(word => word.degree == degree);
  
    if (filter_words.length == 0) {
      return getWord();
    }else {
      var index = Math.floor(Math.random() * (filter_words.length));
      return filter_words[index];
    }
  
  }
  
  function showWord() {
    document.getElementById("word").value = "";
    document.getElementById("wordMain").innerHTML = current_word.mainWord;
  }
  
  function checkWord() {
    var value = document.getElementById("word").value;

    if (current_word.meaningWord == value) {
      var degree = (current_word.degree > 1 ? current_word.degree-1 : current_word.degree);
      alert("Doğru Bildiniz");
    }else {
      var degree = (current_word.degree < 7 ? current_word.degree+1 : current_word.degree);
      alert("Yanlış Bildiniz");
    }

    var data = {
      mainWord: current_word.mainWord,
      meaningWord: current_word.meaningWord,
      degree: degree,
    }

    firebase.database().ref().child("users/" + current_user).child("word").child(current_word.key).set(data);
  }
  
  function workWord(firebase){
  
    var wordRef = firebase.database().ref().child("users/" + current_user).child("word");
    wordRef.on("value", function(snapshot){
      words = [];
      snapshot.forEach(function(item){
        words.push({...item.val(), 'key': item.key});
      });
      current_word = getWord();
      showWord();
    });

    document.getElementById("checkWord").onclick = function(){
      checkWord();
    }
  }
  
  function signup(firebase) {
    //kayıt işlemi
    var signupBtn = document.getElementById("signup-button");
  
    signupBtn.onclick = function(){
      var mail = document.getElementById("signup-mail").value;
      var password = document.getElementById("signup-password").value;
  
      firebase.auth().createUserWithEmailAndPassword(mail, password).then((res) => {
        
        firebase.auth().signInWithEmailAndPassword(mail, password).then((res) => {
          window.location.href = "addWord.html";
        })
        
      }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
  
        if (errorCode == 'auth/email-already-in-use') {
          alert('already use');
        } 
        else if (errorCode == 'auth/weak-password') {
          alert('invalid password');
        }
      });
  
    }
  }
  
  function signin(firebase) {
    //giriş işlemi
    var signinBtn = document.getElementById("signin-button");
  
    signinBtn.onclick = function(){
      var mail = document.getElementById("signin-mail").value;
      var password = document.getElementById("signin-password").value;
  
      firebase.auth().signInWithEmailAndPassword(mail, password).then((res) => {
        window.location.href = "addWord.html";
      })
  
    }
  }
  
  firebase.auth().onAuthStateChanged(function(user) {
    if(user){
      if (page != "index") {
        current_user = user.uid; //kullanıcının id'sini aldık.
        //çıkış işlemi
        signoutBtn.onclick = function(){
          firebase.auth().signOut().then(function() {
            window.location.href = "index.html";
          })  
        }

        document.getElementsByTagName("body")[0].style.display = "block";
        
        if (page == "add") {
          sendToFirebase.onclick = function(){
            addWord(firebase);
          }
        }
        else if (page == "words") {
          listWords(firebase);
        }
        else if (page == "workWord"){
          workWord(firebase);
        }
      }else {
        window.location.href = "addWord.html";
      }
    }else {
      if (page != "index") {
        window.location.href = "index.html";
      }else {
        document.getElementsByTagName("body")[0].style.display = "block";
        signup(firebase);
        signin(firebase);
      }
    }
  
  });
})();