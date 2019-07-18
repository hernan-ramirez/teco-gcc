#
# Configuración de tenant - sitio - login y listas a aplicar el template
#
$dCred = Get-Credential -credential "HRamirez@hjrteco.onmicrosoft.com"
$dTenant = "hjrteco"
$dSite = "GCC"
$dArchivo = ".\provisioning\gcc-lists.xml"


#
# Me conecto a los sitios
#
Set-PnPTraceLog -On -Level:Debug
$dConn = Connect-PnPOnline –Url ("https://" + $dTenant + ".sharepoint.com/sites/" + $dSite) –Credentials $dCred


#
# Aplico el template en destino desde el archivo
#
Apply-PnPProvisioningTemplate -Path $dArchivo -Handlers Lists -Verbose -Connection $dConn