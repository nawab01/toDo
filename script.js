// script.js

// Make draggable elements
function initializeDraggable() {
    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach(draggable => {
        let offsetX, offsetY;
        let lastX, lastY;
        let velocityX = 0, velocityY = 0;
        let inertiaId;

        function onMouseMove(e) {
            const rect = draggable.getBoundingClientRect();
            const containerRect = document.getElementById('toDoContainer').getBoundingClientRect();
            const maxX = containerRect.width - rect.width;
            const maxY = containerRect.height - rect.height;

            let newX = e.clientX - offsetX - containerRect.left;
            let newY = e.clientY - offsetY - containerRect.top;

            // Restrict movement within the container
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            // Update velocity
            if (lastX !== undefined && lastY !== undefined) {
                velocityX = newX - lastX;
                velocityY = newY - lastY;
            }
            lastX = newX;
            lastY = newY;

            draggable.style.left = `${newX}px`;
            draggable.style.top = `${newY}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            startInertia(); // Start inertia effect
        }

        function onTouchMove(e) {
            e.preventDefault(); // Prevents the default touch behavior (like scrolling)
            const touch = e.touches[0];
            onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }

        function onTouchEnd() {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            startInertia(); // Start inertia effect
        }

        function startInertia() {
            if (inertiaId) {
                cancelAnimationFrame(inertiaId);
            }
            function inertia() {
                if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
                    return; // Stop if velocity is very low
                }

                // Apply inertia
                const rect = draggable.getBoundingClientRect();
                const containerRect = document.getElementById('toDoContainer').getBoundingClientRect();
                const maxX = containerRect.width - rect.width;
                const maxY = containerRect.height - rect.height;

                let newX = parseFloat(draggable.style.left) + velocityX;
                let newY = parseFloat(draggable.style.top) + velocityY;

                // Restrict movement within the container
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                draggable.style.left = `${newX}px`;
                draggable.style.top = `${newY}px`;

                // Reduce velocity (simulate friction)
                velocityX *= 0.95;
                velocityY *= 0.95;

                inertiaId = requestAnimationFrame(inertia);
            }
            inertia();
        }

        draggable.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - draggable.getBoundingClientRect().left;
            offsetY = e.clientY - draggable.getBoundingClientRect().top;
            lastX = e.clientX - offsetX;
            lastY = e.clientY - offsetY;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        draggable.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            offsetX = touch.clientX - draggable.getBoundingClientRect().left;
            offsetY = touch.clientY - draggable.getBoundingClientRect().top;
            lastX = touch.clientX - offsetX;
            lastY = touch.clientY - offsetY;

            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
        });
    });
}

const toDoItems = [];

// Factory function for to-dos
const toDos = (title, description, dueDate, status, priority) => ({
    title,
    description,
    dueDate,
    status,
    priority
});

const addToDo = (title, description, dueDate, status, priority) => {
    let newToDo = toDos(title, description, dueDate, status, priority);
    toDoItems.push(newToDo);
    updateToDos();
}

let lastPositionX = 0; // Last x-coordinate used
const offsetX = 10; // Horizontal space between divs
const offsetY = 10; // Vertical space between divs (if needed)

function updateToDos() {
    const toDoContainer = document.getElementById('toDoContainer');
    toDoContainer.innerHTML = '';

    lastPositionX = 0; // Reset to initial position
    const divWidth = 200; // Width of each div (adjust as needed)
    const divHeight = 100; // Height of each div (adjust as needed)

    toDoItems.forEach(todo => {
        const { title, description, dueDate, status, priority } = todo;

        const newDiv = document.createElement('div');
        newDiv.classList.add('draggable');
        newDiv.style.position = 'absolute'; // Ensure absolute positioning
        newDiv.style.left = `${lastPositionX}px`;
        newDiv.style.top = '0px'; // Adjust if vertical positioning is needed
        newDiv.style.width = `${divWidth}px`;
        newDiv.style.height = `${divHeight}px`;

        newDiv.innerHTML = `
            <strong>${title}</strong><br>
            ${description}<br>
            Due: ${dueDate}<br>
            Status: ${status}<br>
            Priority: ${priority}
        `;
        
        toDoContainer.appendChild(newDiv);

        // Update the position for the next div
        lastPositionX += divWidth + offsetX;
    });

    // Reinitialize draggable functionality
    initializeDraggable();
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

// Attach submit event listener to the form
document.getElementById('toDoForm').addEventListener('submit', submitForm);

// Initialize draggable functionality on page load
window.addEventListener('load', initializeDraggable);
