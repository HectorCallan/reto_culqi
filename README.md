1. Descargar y descomprimir en un directorio el proyecto del siguiente repositorio:

https://github.com/HectorCallan/reto_culqi.git

o

https://github.com/HectorCallan/reto_culqi

2. En una ventana de comandos posicionarse en la carpeta donde se descargo los archivos y ejecutar los siguientes pasos:

npm install 

3. Levantar un docker con redis instalado, en este caso se ha utilizado "some-redis" conectado al puerto 6379 ya que se realizo desde una plataforma windows y Redis solo funciona correctamente desde Linux.

4. En la misma ventana de comandos ejecutar el siguiente comando para iniciar el servidor.

node index.js

Nota: Tener en cuenta tener disponible el puerto 3000 para no tener problemas de iniciar el servidor de manera local.

3. Para visualizar los datos de redis, ejecutar el siguiente comando:

redis-commander

Este comando te indicara que se habilito un servidor para ver los datos de redis: 

http://127.0.0.1:8081

4. Para ejecutar las pruebas verificar y validar el package.json que "scripts -> test" se encuente el valor "jest". Luego ejecutar el siguente comando:

npx jest

