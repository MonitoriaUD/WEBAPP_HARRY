from flask import Flask, request, send_file,render_template, jsonify, send_from_directory, redirect, url_for
from openpyxl import load_workbook
from openpyxl.drawing.image import Image
import json
from flask_cors import CORS
from pyexcelerate import Workbook
from fpdf import FPDF
from bs4 import BeautifulSoup
import openpyxl
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Definir las claves y celdas correspondientes
claves_celdas = {
    "Código del Espacio": "D9",
    "Espacio Académico": "D8",
    "Teórico": "B15",
    "Teórico-práctico": "F15",
    "Práctico": "D15",
    "Número de Créditos": "H9",
    "Horas Trabajo Directo": "E10",
    "Horas Trabajo Colaborativo": "G10",
    "Horas Trabajo Autónomo": "I10",
    "Básico": "B13",
    "Complementario": "E13",
    "Intríseco": "G13",
    "Extrínseco": "I13",
    "Conocimientos previos del curso": "A19",
    "Contenidos y Unidades Temáticas": "A45",
    "Enfoque de Aprendizaje y Enseñanza": "A51",
    "Materiales de Estudio": "A75",
    "Justificacion Del Espacio": "A25",
    "Objetivos":"A31",
    "Competencias":"A38",
    "Metodologia":"A51",
    "Resultados de Aprendizaje1":"H38",
    "Resultados de Aprendizaje2":"H39",
    "Resultados de Aprendizaje3":"H40",
    "Resultados de Aprendizaje4":"H41",
    "Resultados de Aprendizaje5":"H42",
    "Resultados de Aprendizaje6":"H43",
    "Recursos":"A67"
}
@app.route('/')
def index():
    return render_template('index.html')
@app.route('/iframes.json')
def get_iframes():
    with open('iframes.json') as f:
        data = f.read()
    return data

@app.route('/programacion_basica')
def programacion_basica():
    return render_template('materias/programacion_basica.html')


@app.route('/syllabus/<filename>', methods=['GET', 'POST'])
def generar_syllabus(filename):
    json_path = os.path.join('static', 'jsonfiles', filename)

    if request.method == 'POST':
        # Obtener los datos del formulario y actualizar el JSON
        with open(json_path, 'r', encoding='utf-8') as json_file:
            datos_materia = json.load(json_file)

        for clave in datos_materia.keys():
            if clave in request.form:
                datos_materia[clave] = request.form[clave]

        # Guardar los datos actualizados en el JSON
        with open(json_path, 'w', encoding='utf-8') as json_file:
            json.dump(datos_materia, json_file, ensure_ascii=False, indent=4)

        return redirect(url_for('generar_syllabus', filename=filename))

    else:
        # Cargar el JSON
        with open(json_path, 'r', encoding='utf-8') as json_file:
            datos_materia = json.load(json_file)

        # Leer el formato HTML desde un archivo
        with open('Formato.html', 'r', encoding='utf-8') as file:
            formato_html = file.read()

        # Parsear el HTML
        soup = BeautifulSoup(formato_html, 'html.parser')

        # Recorrer las claves del JSON y modificar el HTML
        for clave, valor in datos_materia.items():
            elemento_a_modificar = soup.find(id=clave)
            if elemento_a_modificar:
                elemento_a_modificar.string = valor

        # Obtener el HTML modificado
        formato_html_modificado = str(soup)
            # Guardar el nuevo HTML
            # Definir la ruta del archivo HTML
        ruta_html = os.path.join('templates', 'materias', filename.replace('.json', '.html'))
        
        # Guardar el nuevo HTML en la carpeta especificada
        with open(ruta_html, 'w', encoding='utf-8') as file:
            file.write(formato_html_modificado)
        # Renderizar el HTML modificado en la respuesta
        return render_template('mostrar_html.html', formato_html=formato_html_modificado, filename=filename)

@app.route('/descargar_html/<filename>', methods=['GET'])
def descargar_html(filename):
        # Definir la ruta del archivo HTML
    ruta_html = os.path.join('templates', 'materias', filename.replace('.json', '.html'))
    
    # Enviar el archivo HTML como descarga al usuario
    return send_file(ruta_html, as_attachment=True)



@app.route('/programacion_basica/archivo.json')
def get_programacion_basica_jsonfile():
    with open('static/jsonfiles/1_2_Programación_Basica.json', encoding='utf-8') as f:
        data = f.read()
    return data  


@app.route('/syllabus')
def syllabus():
    return render_template('Syllabus.html')


@app.route('/generate_excel/<filename>', methods=['POST'])
def generate_excel(filename):
    json_path = os.path.join('static', 'jsonfiles', filename)
    # Obtener los datos del formulario y actualizar el JSON
    with open(json_path, 'r', encoding='utf-8') as json_file:
        datos_materia = json.load(json_file)
    # Cargar el libro de Excel
    libro_excel = openpyxl.load_workbook('static/Syllabus/Formato.xlsx')
    hoja_excel = libro_excel.active
    #img1 = Image('static/Syllabus/logo.jpg')
    #img2 = Image('static/Syllabus/sigud.PNG')
    #hoja_excel.add_image(img1, 'A1')  # Insertar la primera imagen en la celda A1
    #hoja_excel.add_image(img2, 'G1 ')  # Insertar la segunda imagen en la celda D5
    # Actualizar las celdas en el archivo Excel con la información del JSON
    for clave, celda in claves_celdas.items():
        valor = datos_materia.get(clave, "")
        hoja_excel[celda].value = valor
    
    # Definir la ruta del archivo Excel
    ruta_excel = os.path.join('templates', 'archivos_excel',filename.replace('.json', '.xlsx'))
    
    # Guardar el libro de Excel con la información actualizada
    libro_excel.save(ruta_excel)
    return send_file(ruta_excel, as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)