const toDoItems = [];

// Factory function for to-dos
const toDos = (title, description, dueDate, status, priority, left = 0, top = 0) => ({
    title,
    description,
    dueDate,
    status,
    priority,
    left,
    top
});

function initializeDraggable() {
    const draggables = document.querySelectorAll('.draggableWidget');
    const container = document.getElementById('toDoContainer');

    draggables.forEach(draggable => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let velocityX = 0, velocityY = 0;
        let lastX, lastY;
        let lastTimestamp;
        let inertiaId;

        function onStart(e) {
            if (inertiaId) {
                cancelAnimationFrame(inertiaId);
            }
            isDragging = true;
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            initialLeft = draggable.offsetLeft;
            initialTop = draggable.offsetTop;
            lastX = initialLeft;
            lastY = initialTop;
            lastTimestamp = Date.now();

            draggable.style.zIndex = 1000; // Bring the dragged element to front

            if (e.type === 'touchstart') {
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
            } else {
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
            }
        }

        function onMove(e) {
            if (!isDragging) return;
            e.preventDefault();

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const dx = clientX - startX;
            const dy = clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            // Constrain to container
            const maxX = container.clientWidth - draggable.offsetWidth;
            const maxY = container.clientHeight - draggable.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));

            draggable.style.left = `${newLeft}px`;
            draggable.style.top = `${newTop}px`;

            // Calculate velocity
            const currentTimestamp = Date.now();
            const deltaTime = currentTimestamp - lastTimestamp;
            if (deltaTime > 0) {
                velocityX = (newLeft - lastX) / deltaTime * 16.67; // Adjust for 60 FPS
                velocityY = (newTop - lastY) / deltaTime * 16.67;
            }

            lastX = newLeft;
            lastY = newTop;
            lastTimestamp = currentTimestamp;

            // Save updated position to toDoItems
            const index = Array.from(container.children).indexOf(draggable);
            toDoItems[index].left = newLeft;
            toDoItems[index].top = newTop;
            saveToDos();
        }

        function onEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            draggable.style.zIndex = ''; // Reset z-index
            startInertia();
        }

        function startInertia() {
            const friction = 0.95;
            const stopThreshold = 0.5;

            function inertia() {
                if (Math.abs(velocityX) < stopThreshold && Math.abs(velocityY) < stopThreshold) {
                    return;
                }

                let newLeft = parseFloat(draggable.style.left) + velocityX;
                let newTop = parseFloat(draggable.style.top) + velocityY;

                // Constrain to container
                const maxX = container.clientWidth - draggable.offsetWidth;
                const maxY = container.clientHeight - draggable.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));

                draggable.style.left = `${newLeft}px`;
                draggable.style.top = `${newTop}px`;

                // Update toDoItems
                const index = Array.from(container.children).indexOf(draggable);
                toDoItems[index].left = newLeft;
                toDoItems[index].top = newTop;

                velocityX *= friction;
                velocityY *= friction;

                inertiaId = requestAnimationFrame(inertia);
            }

            inertiaId = requestAnimationFrame(inertia);
        }

        draggable.addEventListener('mousedown', onStart);
        draggable.addEventListener('touchstart', onStart);
    });
}

function addToDo(title, description, dueDate, status, priority) {
    let newToDo = toDos(title, description, dueDate, status, priority);
    toDoItems.push(newToDo);
    saveToDos();
    updateToDos();
    positionItems(); // Call positionItems after adding a new to-do
}

function updateToDos() {
    const toDoContainer = document.getElementById('toDoContainer');
    toDoContainer.innerHTML = '';

    toDoItems.forEach((todo, index) => {
        const { title, description, dueDate, status, priority, left, top } = todo;

        const newDiv = document.createElement('div');
        newDiv.classList.add('draggableWidget');
        newDiv.style.position = 'absolute';
        newDiv.style.left = `${left}px`;
        newDiv.style.top = `${top}px`;

        newDiv.innerHTML = `
            <strong>${title}</strong><br>
            ${description}<br>
            Due: ${dueDate}<br>
            Status: ${status}<br>
            Priority: ${priority}
        `;

        toDoContainer.appendChild(newDiv);
    });

    initializeDraggable();
}

function saveToDos() {
    localStorage.setItem('toDoItems', JSON.stringify(toDoItems));
}

function loadToDos() {
    const storedToDos = localStorage.getItem('toDoItems');
    if (storedToDos) {
        toDoItems.splice(0, toDoItems.length, ...JSON.parse(storedToDos));
        updateToDos();
    }
}

function submitForm(event) {
    event.preventDefault();
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let status = document.getElementById('status').value;
    let priority = document.getElementById('priority').value;
    addToDo(title, description, dueDate, status, priority);
    document.getElementById('toDoForm').reset();
}

function clearData() {
    toDoItems.length = 0;
    localStorage.removeItem('toDoItems');
    updateToDos();
}

function positionItems() {
    const container = document.getElementById('toDoContainer');
    const items = document.querySelectorAll('.draggableWidget');
    const containerWidth = container.clientWidth;
    const itemWidth = 200; // Assuming a fixed width for items
    const itemHeight = 100; // Assuming a fixed height for items
    const gap = 10; // Gap between items

    let row = 0;
    let col = 0;

    items.forEach((item, index) => {
        if ((col + 1) * (itemWidth + gap) > containerWidth) {
            col = 0;
            row++;
        }

        const left = col * (itemWidth + gap);
        const top = row * (itemHeight + gap);

        item.style.left = `${left}px`;
        item.style.top = `${top}px`;

        toDoItems[index].left = left;
        toDoItems[index].top = top;

        col++;
    });

    saveToDos();
}

// Attach event listeners
document.getElementById('toDoForm').addEventListener('submit', submitForm);
document.getElementById('clearDataBtn').addEventListener('click', clearData);

// Load to-dos from local storage on page load and handle window resize
window.addEventListener('load', () => {
    loadToDos();
    positionItems();
    window.addEventListener('resize', positionItems);
});