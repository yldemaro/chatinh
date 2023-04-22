module.exports = {
    css: {
      loaderOptions: {
        less: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
    devServer:{
      headers:{"Access-Control-Allow-Origin": "*"},
      proxy:'http://3.15.149.136:3555',
      changeOrigin:true
    }
  };