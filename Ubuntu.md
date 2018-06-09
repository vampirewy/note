# Ubuntu

## <font face='微软雅黑' color='Chocolate'>**下载、制作**</font>

- 首先去官网下载ubuntn,https://cn.ubuntu.com/?_ga=2.246826820.1982977902.1528459394-1594780594.1524023104

- 下载完成后，进行USB启动制作；
      
      1.官方教程https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-windows?_ga=2.242174530.1746861324.1507700161-1586045268.1507700161#0

      2.访问Rufus，下载这个软件，功能是用来进行U盘制作，开箱即用；

      3.插上U盘，会自动读取你的U盘；整个U盘会被清空，如有重要文件，请先保存；进度条完成后，即制作完成；

      4.重启电脑，本人现在是lenovo，按F12，选择USB启动；然后会进入ubuntu安装界面，可以先try，让你体检，不想就直接安装install now；本人是直接把windows系统格掉，换成整个linux系统，所以选择Erase disk and install Ubuntu，如果需要双系统，请选择install Ubuntu alongeside....;跟着步骤走就行；

## <font face='微软雅黑' color='Chocolate'>**Ubuntu安装npm、node**</font>

- sudo apt-get install nodejs(版本低)
 
- sudo apt-get install npm(版本低)

## <font face="微软雅黑" color='Chocolate'>**安装webpack,webpack-cli报asyncwrite is not function通常是由于node版本过低造成，解决方案如下:**</font>

- sudo npm install n -g (安装n模块);

- sudo npm cache clean -f (清除缓存);

- sudo n 8.11.2 (nodejs版本号)(升级node版本);

