<?php

$target_dir = "walls/";
$conf_filename = $_POST['fname'];
$target = $target_dir.$conf_filename;
if(file_put_contents($target, $_POST['conf'])){
	echo "Saved";
}
else{
	echo "Problem saving new config";
}
// echo $_POST['conf'];

?>
