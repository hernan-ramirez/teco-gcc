# GCC - Aplicación de gestión de comunicaciones de contratistas

Esta aplicación consta de tres listas vinculadas.

Las listas principales son los 'Eventos' y las 'Comunicaciones'.
Un evento contiene varias comunicaciones y son filtradas por su seleccion.
Al seleccionar una comunicación se muestra un panel de propiedades y acciones.

> Nota. Esta aplicación es del tipo de página completa, por lo que luego de instalar es necesario crear una página en el sitio desde la solapa 'Apliaciones'.


## Solución

La solución instala las tres listas necesarias y los scripts para ejecutarse en un ámbito local de la colección.
Para instalarla es necesario contar con un sitio y un App Catalog de la colección.

Los pasos son:

* Crar sitio (del tipo comunicaciones si es posible, en blanco)
* Agregar App Catalog
* Instalar las listas desde el template
* Instalar la solución SPFX 

Para crear el AppCatalog se debe contar con el `SharePoint Online Management Shell` y ser administrador de tu tenant.
La referencia a las siguientes sentencias que vamos a ejecutar se encuentran en 
https://docs.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog

* Bajar e instalar el `SharePoint Online Management Shell` 
	* desde https://www.microsoft.com/en-us/download/details.aspx?id=35588
* Bajar e instalar le `SahrePoint PnP Powershell` 
	* desde https://github.com/SharePoint/PnP-PowerShell 


correr las siguientes líneas desde Powershell luego de crear el sitio:

> Nota: Reemplazar el tenant y sitio destino.
> El tenant es solo el nombre de tal.

```bash
$tenant = "mi-tenant" # Sólo el nombre del tenant
$sitio = "mi-sitio" # Sólo el nombre del sitio
$cred = Get-Credential

$adminConn = Connect-SPOService -Url ("https://" + $tenant + "-admin.sharepoint.com") -Credential $cred

$site = Get-SPOSite ("https://" + $tenant + ".sharepoint.com/sites/" + $sitio)

# Agrega el AppCatalog a la colección
Add-SPOSiteCollectionAppCatalog -Site $site
# Si no funciona con el objeto 'Site' poner directamente el string de la url
Add-SPOSiteCollectionAppCatalog -Site ("https://" + $tenant + ".sharepoint.com/sites/" + $sitio)
```

Luego para instalar las listas correr la siguiente linea

```bash
$siteConn = Connect-PnPOnline –Url ("https://" + $tenant + ".sharepoint.com/sites/" + $sitio) –Credentials $cred

# Instala las listas necesarias con contenido de ejemplo
Apply-PnPProvisioningTemplate -Path ".\provisioning\gcc-lists.xml" -Handlers Lists -Verbose -Connection $siteConn
```

Por último para instalar el paquete SPFX ejecutar un Add-PnPApp.
Referencia:

https://docs.microsoft.com/en-us/powershell/module/sharepoint-pnp/add-pnpapp?view=sharepoint-ps

```bash
# Agrega y publica el SPFX
Add-PnPApp -Path ".\sharepoint\solution\gcc-app.sppkg" -Scope Site -Overwrite -Publish -SkipFeatureDeployment -Connection $siteConn
```

Para este último paso, el scipt completo para conexión y publicación en producción seria:
```bash
# Si se trabaja con varias versiones de modulos instalados, fijar la que se usará
# Import-Module -Name "C:\Program Files\WindowsPowerShell\Modules\SharePointPnPPowerShellOnline\3.14.1910.0\SharePointPnPPowerShellOnline.psd1" -DisableNameChecking
Connect-PnPOnline -Url https://cablevisionfibertel.sharepoint.com/sites/gcc -Credential Get-Credential
Add-PnPApp -Path ".\sharepoint\solution\gcc-app.sppkg" -Scope Site -Overwrite -Publish -SkipFeatureDeployment
```

Luego de esto, ir al sitio y:
* En la lista de `Contratistas` crear un nuevo contratista o editar uno con tu mail de login en el campo `EmailNotificacion`
* Crear una página.
	* En las plantillas de páginas aparecerá una solapa de `Aplicaciones` donde se verá la app de GCC


## Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

El bundle del paquete produce lo siguiente:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources


### Build options

* gulp clean 
* gulp serve


### Deploy

* gulp clean
* gulp bundle --ship
* gulp package-solution --ship
* Subir .sppkg file desde `sharepoint\solution` al App Catalog de la colección
	* Ejemplo: https://`<tenant>`.sharepoint.com/sites/`<site>`/AppCatalog
* Agregar la web part al site collection (opcional)
* Agregar una página del tipo "Aplicación"


