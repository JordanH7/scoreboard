function menu_display(show) {
    const display = show ? "block" : "none";
    document.getElementById('menu-overlay').style.display = display
}

function page_display(show, ...elementId) {
    const display = show ? "flex" : "none";
    if (elementId[0] == "all") {
        elementId = ['match-page', 'randomizer-page', 'saves-page', 'stats-page', 'replay-page']
        menu_display(show);
    }
    elementId.forEach(
        function(element) {
            document.getElementById(element).style.display = display
        }
    );
}
