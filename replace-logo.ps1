$src = 'C:\Users\Admin\.cursor\projects\d-Project-PlanTravelingAI-TravelMind\assets\c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_41f2ab500115b56328c33daf6adcab74_images_image-8a99ae6c-3578-42b2-abc3-de22c489670d.png'
$dstLogo = 'd:\Project\PlanTravelingAI\TravelMind\apps\web\public\logo.png'
$dstFav  = 'd:\Project\PlanTravelingAI\TravelMind\apps\web\public\favicon.png'
Copy-Item -LiteralPath $src -Destination $dstLogo -Force
Copy-Item -LiteralPath $src -Destination $dstFav  -Force
Get-ChildItem 'd:\Project\PlanTravelingAI\TravelMind\apps\web\public\*.png' |
  Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
