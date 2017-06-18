var HISTORY_SIZE = 10

$(function(){
	//init socket.io
	var socket = io();
	// Get username from user
	var curUser = "";
	// starting id for the user
	var msgID = Math.floor(Math.random() * 1000000 + 1);
	// Submit Button - Add message to chat box + send message to server
	var users = []; //online users

	var preMsgs = []; //for auto complete
	var msgIndex = 0;

	// Require the user to choose a user name
	var chooseUserName = function(){
		curUser = prompt("Please Enter Your Username:");
		while (!curUser)
		{ 
			curUser = prompt("Username can't be empty!\n"
							+ "Please Enter Your Username Again:");
		}
		socket.emit('chose name', curUser);
	};

	//update the html about online users
	var updateUsers = function(){
		usersStr = "";
		if (users.length > 0) 
			usersStr = users.join(', ');
		else 
			usersStr = 'none';
		$("#onlineUsers").text("Online Users: " + usersStr);
	};

	// Enter a new message into the chat box
	var enterMsg = function(msgData){
		var newMsg = $("<li></li>").attr("class", "chatMsg");
		newMsg.attr("id", msgData.id);
		newMsg.append('(' + msgData.time + ') ');
		newMsg.append("<b>" + msgData.sender + ": </b>");
		newMsg.append(msgData.content);
		if(msgData.sender == curUser)
		{
			newMsg.append("<div class=\"rem\">X</div>");
			newMsg.attr("class", "msg me");
		}
		else
		{
			newMsg.attr("class", "msg you");
		}
		newMsg.append("<br/>");
		$("#chatBox").append(newMsg);
		if(msgData.sender == curUser)
		{
			$("#" + msgData.id + " .rem").click(function(){
				$(this).parent().remove();
				socket.emit('delete message', msgData.id);
			});
		}
		scrollToBottom();
	};

	//when submitting send message to server and add to html
	$("#sbmBtn").click(function(){
		var msg = $("#msgBox").val();
		if (msg != "")
		{
			var msgData = {id: socket.id + '_' + msgID++, 
						   time: getCurTime(), sender: curUser,
						   content: msg};
			$("#msgBox").val("");
			socket.emit('chat message', msgData);
			enterMsg(msgData);
			preMsgs.push(msg);
			if (preMsgs.length > HISTORY_SIZE)
				preMsgs.shift();
			else
				msgIndex = preMsgs.length;
		}
		return false;
	});

	//when pressing enter key anywhere in the document send message
	$("body").keydown(function(event){
		if(event.which == 13)
			$("#sbmBtn").click();
	});

	//when pressing on up or down keys - move up and down in your messages history
	$("#msgBox").keydown(function(event){
		if (event.which == 38 && msgIndex != 0) //up key + not at the top of the history
		{
			msgIndex--;
			$("#msgBox").val(preMsgs[msgIndex]);
		}
		else if (event.which == 40 && msgIndex < preMsgs.length) //down key
		{
			msgIndex++;
			if (msgIndex == preMsgs.length)
				$("#msgBox").val("");
			else
				$("#msgBox").val(preMsgs[msgIndex]);
		}
	});

	socket.on('user join', function(name){
		$("#chatBox").append("<li class=\"msg notification\">" + name + 
							" has joined the chat room.</li>");
		users.push(name);
		updateUsers();
		scrollToBottom();
	});

	socket.on('chat message', function(msgData){
		enterMsg(msgData);
	});

	socket.on('delete message', function(msgData){
		$('#'+ msgData.id).remove();
	});

	socket.on('user leave', function(name){
		$("#chatBox").append("<li class=\"msg notification\">" + name + 
							" has left the chat room.</li>");
		//delete user from list of online users
		if (users.indexOf(name) > -1)
		{
 			users.splice(users.indexOf(name), 1);
			updateUsers();
		}
		scrollToBottom();
	});

	socket.on('taken name', function(){
		alert("This user name is already taken!");
		chooseUserName();
	});

	socket.on('valid name', function(otherUsers){
		users = otherUsers;
		$("#userName").append("<b>" + curUser + "</b>");
		updateUsers();
	});

	chooseUserName();
});
// Get Current Time in this format HH:MM:SS
function getCurTime() {
		var today = new Date();
	    return ((today.getHours() < 10)?"0":"") + today.getHours()
	      	+ ":" + ((today.getMinutes() < 10)?"0":"") + 
	      	today.getMinutes() + ":" + 
	      	((today.getSeconds() < 10)?"0":"") + today.getSeconds();
}
//scroll chat box to the bottom of the page
function scrollToBottom(){
	$('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
}