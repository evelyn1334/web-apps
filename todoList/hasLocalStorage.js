function getTodoItems() {
    // find and parse the todo items saved in local storage
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.substring(0, 4) == "todo") {
            var item = localStorage.getItem(key);
            var todoItem = JSON.parse(item);
            todos.push(todoItem);
        }
    }
    addTodosToPage();
}

function saveTodoItem(todoItem) {
    var key = "todo" + todoItem.id;
    var item = JSON.stringify(todoItem);
    localStorage.setItem(key, item);
}
