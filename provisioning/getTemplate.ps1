#
# Configuración de tenant - sitio - login y listas a obtener el template
#
$oCred = Get-Credential -credential "hramirez@proveedor.teco.com.ar"
$oTenant = "cablevisionfibertel"
$oSite = "gcc"
$oLists = @("Contratistas", "Eventos", "Comunicaciones")
$oArchivo = ".\provisioning\gcc-lists.xml"


#
# Estableciendo conexión
#
Set-PnPTraceLog -On -Level:Debug
$oConn = Connect-PnPOnline –Url ("https://" + $oTenant + ".sharepoint.com/sites/" + $oSite) –Credentials $oCred


# Get Template
$oTemplate = Get-PnPProvisioningTemplate -OutputInstance -Handlers Lists -Connection $oConn


#
# Obtengo el template solo de las listas requeridas en la configuración
# 
$lt = $oTemplate.Lists | Where-Object { $_.Title -in $oLists }
$oTemplate.Lists.Clear()

foreach ($l in $lt) {
  $oTemplate.Lists.Add($l)
}

$oTemplate.Lists.Title

#
# Guardo el template en archivo
#
Save-PnPProvisioningTemplate -InputInstance $oTemplate -Out $oArchivo

#
# Opcion de traer datos por lista
#
Add-PnPDataRowsToProvisioningTemplate -Path $oArchivo -List 'Contratistas' -Query '<view></view>' -Connection $oConn