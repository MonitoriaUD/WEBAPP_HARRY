function enviarOpinion(event) {
    event.preventDefault();
    const form = event.target;
    const opinion = form.querySelector('textarea').value;
    const guardar = form.querySelector('select').value;
    if (opinion.trim() === '' || guardar.trim() === '') {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }
    alert('Gracias por su opinión.');
    form.reset();
}

let jsonData; 
let fileName = "";
let input;
let  jsonString;

function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    fileName = file.name;
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (evt) {
            jsonData = JSON.parse(evt.target.result); // Parseamos el JSON inicial
            
            const jsonEditorDiv = document.getElementById('jsonEditor');
            console.log('JSON leido:', jsonData);
    // Crear elementos HTML para mostrar las claves y los formularios para editar los valores
        for (let key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                // Crear el contenedor div para cada par clave-valor
                let pairDiv = document.createElement('div');
                pairDiv.classList.add('jsonPair'); // Añadir clase al contenedor div
                jsonEditorDiv.appendChild(pairDiv);

                // Crear el elemento de etiqueta para la clave
                let label = document.createElement('label');
                label.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ': '; // Convertir la clave en modo enunciado
                pairDiv.appendChild(label);

                // Crear el elemento de formulario para el valor
                input = document.createElement('input');
                input.type = 'text';
                input.value = jsonData[key];
                input.setAttribute('data-key', key); // Añadir un atributo de datos para almacenar la clave asociada
                pairDiv.appendChild(input);
            }
        }reader.onerror = function (evt) {
            console.error("Error al leer el archivo");
        }
        }
    } else {
        console.error("Por favor selecciona un archivo JSON");
    }
}


// Supongamos que ya has cargado el JSON y está almacenado en una variable llamada "data"

// Función que se activa después de cargar el JSON
function modificarJSON() {
    // Obtener todos los formularios de entrada
    const inputs = document.querySelectorAll('#jsonEditor input');
    
    // Objeto para almacenar los nuevos valores del JSON
    let newData = {};
    
    // Iterar sobre los formularios de entrada y almacenar los nuevos valores
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        const value = input.value;
        newData[key] = value;
    });
     jsonString = JSON.stringify(newData,null, 2);
        // Hacer lo que necesites con el nuevo JSON (en este ejemplo solo lo mostramos en la consola)
     console.log('Nuevo JSON:', jsonString);

        // Hacer lo que necesites con el nuevo JSON (en este ejemplo solo lo mostramos en la consola)
           // Crear un blob con el JSON
        let blob = new Blob([jsonString], { type: 'application/json' });
    
        // Crear una URL para el blob
        let url = URL.createObjectURL(blob);
    
        // Crear un enlace de descarga
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName // Nombre del archivo de descarga
        a.textContent = 'Descargar JSON';
    
        // Agregar el enlace al documento
        document.body.appendChild(a);
    
        // Hacer clic en el enlace para descargar el archivo
        a.click();
    
        // Eliminar el enlace del documento
        document.body.removeChild(a);
    
        // Liberar el objeto URL
        URL.revokeObjectURL(url);
    // Por ejemplo, puedes enviar el JSON modificado a algún lugar
    // o utilizarlo en tu aplicación de alguna otra manera
}

document.getElementById('process').addEventListener('click', () => {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const jsonData = JSON.parse(content);
            localStorage.setItem('jsonData', JSON.stringify(jsonData));
            localStorage.setItem('jsonFileName', file.name);
        };
        reader.readAsText(file);
    }
});

document.getElementById('download').addEventListener('click', async () => {
    const jsonData = localStorage.getItem('jsonData');
    const jsonFileName = localStorage.getItem('jsonFileName');

    if (jsonData && jsonFileName) {
        const response = await fetch('http://127.0.0.1:5000/generate_excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jsonData, jsonFileName }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = jsonFileName.replace('.json', '.xlsx');
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error('Error generating Excel');
        }
    } else {
        console.error('No JSON data or file name found');
    }
});

document.getElementById('downloadpdf').addEventListener('click', async () => {
    const jsonData = localStorage.getItem('jsonData');
    const jsonFileName = localStorage.getItem('jsonFileName');

    if (jsonData && jsonFileName) {
        const response = await fetch('http://127.0.0.1:5000/generate_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jsonData, jsonFileName }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = jsonFileName.replace('.json', '.pdf');
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error('Error generating pdf');
        }
    } else {
        console.error('No JSON data or file name found');
    }
});