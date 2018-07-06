function Todo(id, task, who, dueDate) {
    this.id = id;
    this.task = task;
    this.who = who;
    this.dueDate = dueDate;
    this.done = false;
    this.latLong = [];
}

var todos = [];  // global variable, important!

function init() {
    var submitTodo = document.getElementById("submitTodo");
    var submitSearch = document.getElementById("submitSearch");
    submitTodo.onclick = getFormData;
    submitSearch.onclick = searchList;

    getTodoItems();
}

function addTodosToPage() {
    var ul = document.getElementById("todoList");
    var listFragment = document.createDocumentFragment();
    // iterate through todos to extract individual todo items
    for (var i = 0; i < todos.length; i++) {
        var todoItem = todos[i];
        var li = createNewTodo(todoItem);
        listFragment.appendChild(li);
    }
    ul.appendChild(listFragment);
}

function getFormData() {
    var task = document.getElementById("task").value.trim();
    if (checkInputText(task, "Please enter a task")) {
        return;
    }
    var who = document.getElementById("who").value.trim();
    if (checkInputText(who, "Please enter a person to do the task")) {
        return;
    }
    var date = document.getElementById("dueDate").value.trim();
    if (checkInputText(date, "Please enter a due date")) {
        return;
    }

    // use the current time in milliseconds as a unique id
    // can consider other schemes for better performance
    var id = (new Date()).getTime();
    var todoItem = new Todo(id, task, who, date);
    todos.push(todoItem);
    displayLocation();
}

function checkInputText(value, msg) {
    if (value == null || value == "") {
        alert(msg);
        return true;
    }
    return false;
}

function addTodoToPage(todoItem) {
    var ul = document.getElementById("todoList");
    var li = createNewTodo(todoItem);
    ul.appendChild(li);
    document.forms[0].reset();
}

function createNewTodo(todoItem) {
    var li = document.createElement("li");
    // assign an id to the li element so it can be identified
    li.setAttribute("id", todoItem.id);
    var spanTodo = document.createElement("span");
    var daysLeft = calcDaysLeft(todoItem.dueDate);
    spanTodo.innerHTML = buildTodoStr(todoItem, daysLeft);

    var spanDone = document.createElement("span");
    if (!todoItem.done) {
        spanDone.setAttribute("class", "notDone");
        spanDone.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }
    else {
        spanDone.setAttribute("class", "done");
        // string represents a check mark
        spanDone.innerHTML = "&nbsp;&#10004;&nbsp;";
    }
    spanDone.onclick = updateDone;

    var spanDelete = document.createElement("span");
    spanDelete.setAttribute("class", "delete");
    spanDelete.innerHTML = "&nbsp;&#10007;&nbsp;";
    spanDelete.onclick = deleteItem;

    li.appendChild(spanDone);
    li.appendChild(spanTodo);
    li.appendChild(spanDelete);

    return li;
}

function calcDaysLeft(dueDate) {
    // use date string to rid the current time of units lesser than day
    var nowDate = (new Date()).toDateString();
    var nowMillis = Date.parse(nowDate)
    var nowDays = Math.floor(nowMillis / 1000 / 60 / 60 / 24);
    var dueDateMillis = convertDueDate(dueDate);
    var daysStr;

    try {
        // throw an exception if the due date string cannot be correctly parsed
        if (isNaN(dueDateMillis)) {
            throw new Error("Date format not recognized");
        }
        else {
            var dueDateDays = Math.floor(dueDateMillis / 1000 / 60 / 60 / 24);
            var daysLeft = dueDateDays - nowDays;
            // append single/plural suffix according to the numer of days
            var suffix = "";
            if (Math.abs(daysLeft) != 1) {
                suffix = "s";
            }
            if (daysLeft >= 0) {
                daysStr = "(" + daysLeft + " day" + suffix + ")";
            }
            else {
                daysStr = "(OVERDUE by " + Math.abs(daysLeft) + " day" + suffix + ")";
            }
        }
    }
    catch (ex) {
        alert(ex.message);
        daysStr = "";
    }
    finally {
        return daysStr;
    }
}

function convertDueDate(dueDate) {
    // workaround for the one-day offset problem when the date format
    // is YYYY-MM-DD, which causes due date to be UTC instead of local
    // can consider a more sophisticated method
    var dueDateMillis;
    if (dueDate.indexOf("-") != -1) {
        var dueDateUTC = (new Date(dueDate)).toUTCString();
        dueDateMillis = Date.parse(dueDateUTC);
    }
    else {
        var dueDateLocal = (new Date(dueDate)).toDateString();
        dueDateMillis = Date.parse(dueDateLocal);
    }

    return dueDateMillis;
}

function deleteItem(e) {
    var span = e.target;
    var id = span.parentElement.id;
    // find and remove the item in local storage
    var key = "todo" + id;
    localStorage.removeItem(key);

    // find and remove the item in the array
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            todos.splice(i, 1);
            break;
        }
    }

    // find and remove the item in the page
    var li = span.parentElement;
    var ul = document.getElementById("todoList");
    ul.removeChild(li);
}

function updateDone(e) {
    var span = e.target;  // get the element that was clicked upon
    var id = span.parentElement.id;

    // find the todos item whose id is the same as that of the clicked element
    for (var i = 0; i < todos.length; i++) {
        if (todos[i].id == id) {
            var todoItem = todos[i];
            break;
        }
    }

    if (todoItem.done) {
        todoItem.done = false;
        span.setAttribute("class", "notDone");
        span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }
    else {
        todoItem.done = true;
        span.setAttribute("class", "done");
        // string represents a check mark
        span.innerHTML = "&nbsp;&#10004;&nbsp;";
    }
        saveTodoItem(todoItem);  // save the object back to localStorage
}

function searchList() {
    clearSearchResults();
    var searchTerm = document.getElementById("searchTerm").value.trim();
    // check if search term or to-do list is empty
    if (checkInputText(searchTerm, "Please enter a string to search for")) {
        return;
    }
    if (!todos.length) {
        alert("Nothing to search from");
        return;
    }

    // get regexp pattern according to search term and checkbox
    var re = toggleWholeWords(searchTerm);
    var results = [];

    for (var i = 0; i < todos.length; i++) {
        // construct full to-do item if .who or .task matches the pattern
        if (re.test(todos[i].who) || re.test(todos[i].task)) {
            var match = todos[i].who + " needs to " + todos[i].task +
                        " by " + todos[i].dueDate;
            results.push(match);
        }
    }

    if (results.length) {
        showSearchResults(results);
    }
    else {
        alert("No match found");
    }
}

function toggleWholeWords(searchTerm) {
    var wholeWords = document.getElementsByName("wholeWords")[0];
    // add word boundaries to pattern if the wholeWords option is checked
    var re;
    if (wholeWords.checked) {
        re = new RegExp("\\b" + searchTerm + "\\b", "ig");
    }
    else {
        re = new RegExp(searchTerm, "ig");
    }

    return re;
}

function showSearchResults(results) {
    var ul = document.getElementById("matchResultsList");
    var resultsFrag = document.createDocumentFragment();
    // iterate through the results and create corresponding li elements
    for (var i = 0; i < results.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = results[i];
        resultsFrag.appendChild(li);
    }
    ul.appendChild(resultsFrag);
}

function clearSearchResults() {
    var ul = document.getElementById("matchResultsList");
    // repeatedly remove the first child element until there is none
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}
