const Data = (
    function init() {
        fetch('./simple/developer/appToDeveloper.json')
            .then(response => response.json())
            .then(data => {
                const developer = document.createElement('ul')
                for (const key in data) {
                    const li = document.createElement('li')
                    li.textContent = `${key}: ${data[key]}`
                    developer.appendChild(li)
                }
                document.body.appendChild(developer)
            })
    }
);