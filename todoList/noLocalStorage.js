// can consider using AJAX or cookies for a more functional fallback
// though that would require some restructuring of the code
function getTodoItems() {
    var message = "No Local Storage support! All data will be lost upon reloading the page";
    console.log(message);
    alert(message);
}

function saveTodoItem(todoItem) {
    console.log("Data cannot be saved due to lack of Local Storage support")
}
