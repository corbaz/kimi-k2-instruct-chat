#!/bin/zsh
#
# Este script envuelve la ejecución de npm run dev para asegurar que
# el entorno de NVM se cargue correctamente, especialmente para ejecutores
# de tareas como el de VS Code.

# Cargar NVM (manera estándar y segura)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Activar la versión de Node del proyecto (usará .nvmrc)
echo "Activando la versión de Node a través de nvm..."
nvm use

# Diagnóstico: Mostrar la versión de node y npm que se está usando
echo -n "Versión de Node: "
node -v
echo -n "Ruta de npm: "
which npm

# Ejecutar el comando final
echo "\nLanzando el servidor de desarrollo..."
npm run dev

