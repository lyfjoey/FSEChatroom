$(function() {

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  var username;
  var submitTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  // Sets the client's username
  function setUsername () {
    username = $usernameInput.val().trim();
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    var submitTime = new Date($.now());
    submitTime = submitTime.toString();
    if (message) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message,
        submitTime: submitTime
      });
      socket.emit('new message', {message: message, submitTime: submitTime});
    }
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data) {

    var $usernameDiv;
    if (data.username !== username) {
      $usernameDiv = $('<span class="username"/>')
        .text(data.username);
    } else {
      $usernameDiv = $('<span class="username"/>')
        .text('me');
    }
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
    var $datetimeDiv = $('<span class="datetime">')
      .text(data.submitTime);

    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .append($datetimeDiv);
    $messageDiv.append('<br>');
    $messageDiv.append($usernameDiv, $messageBodyDiv);

    $messages.append($($messageDiv));
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
      } else {
        setUsername();
      }
    }
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'old messages', update the chat body
  socket.on('old messages', function(data) {
    data.forEach(function(item) {
      addChatMessage(item);
    });
  });

});