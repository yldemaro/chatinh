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
      proxy:'http://3.17.204.81:3555',
      changeOrigin:true
    }
  };