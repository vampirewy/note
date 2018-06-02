### 前言

<font color='#D2691E'>**由于单位使用的是gulp来构建ionic1项目，利用业余时间学习了Webpack，在升级到webpack4之前，手动搭建vue+webpack项目，Webpack已经升级到4.xx版本，添加了mode模式等，不用再设置环境变量。本人利用ionic1搭建了一个demo,配上Webpack，现主要将Webpack配置做下总结:**</font>

<font color='#FF7F50'>**一、安装**</font>

    1.全局
      npm / yarn  i webpack webpack-cli -g

    2.项目单独
      npm i webpack webpack-cli --save-dev

<font color='#FF7F50'>**二、配置**</font>

    1.根目录下新建文件 webpack.config.js;

    2.引入需使用的插件;

    3.配置入口、输出、module、plugin等;

    4.本地启动需要配置devServer;

    5.本人是将mode模式设置在package.json中，使用npm run 启动;

<font color='#FF7F50'>**三、Entry**</font>

<font color='red'>**本人主要使用SPA**</font>

    1.入口文件和第三方类库分开,对象形式填写(里面命名上下顺序与index.html注入顺序一致，如果依赖第三方，需将第三方放到前面，不然报错);

        entry:{
          app:'路径',
          vendor:'路径'
        }

<font color='#FF7F50'>**四、Output**</font>

    1.path不需要设置，默认dist文件夹;

    2.filename输出文件名，一般'js/[name].[hash:8].js',配上hash值，清缓存;

    3.chunkFilename不被放在entry中，但需打包配置的因为有人 ;本人主要是按需加载使用,导出一块一块小文件;在ionic1项目中需要配置require.ensure使用;

<font color='#FF7F50'>**五、Module**</font>

    常用loader:

        1.raw-loader 将html转成字符串，本人主要按需加载html使用;

        2.css-loader、less-loader、style-loader,使用less-loader需先安装less,不然报错(less module出错);

        3.配置babel,babel-loader,需配置babel文件及安装babel相关插件;

        4.url-loader、file-loader等;

<font color='#FF7F50'>**六、Plugin**</font>

    常用插件:

    1.自动生成index.html: html-webpack-plugin;

        new HtmlWebpackPlugin({
          template:'./index.html',
          minify:{
            collapseWhitespace:true, //删除空白行和换行
            removeComments:true, //去除注释
            minifyJS:true //去除注释的script标签
          },
          hash:true //在script和link里注入hash值，主要为清除缓存
        })

    2.提取css不以style标签形式注入:extract-text-webpack-plugin,压缩css直接在css-loader里进行;

        new ExtractTextPlugin({
          filename:'styles/[name].[chunkhash:8].css'
        })

      3.JS压缩，mode模式自动开启

<font color='red'>**extract-text-webpack-plugin因为webpack4，需将这个插件更新到最新 npm i extract-text-webpack-plugin@next**</font>


<font color='#FF7F50'>**七、提升构建速度**</font>

    1.启动babel缓存，加快编译速度;

    2.启用happyhack插件，将任务分解给多个子线程去处理，子线种处理完后结果发给主线程;开启共享池，防止资源占用更多;

    3.使用webpack-parallel-uglify-plugin插件,开启多线程，加快速度;