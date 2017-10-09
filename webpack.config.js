const Webpack = require('webpack');
const resolve = require('path').resolve;


const pkg = require('./package.json');


module.exports = (env = {}) => {
    const isProduction = env.production === true;

    // console.log('~' + resolve(__dirname, pkg.path.build + 'styles/_setup.scss'));
    // return;

    let config = {
        entry: resolve(__dirname, pkg.path.build + 'scripts/run.js'),

        output: {
            path: resolve(__dirname, pkg.path.assets + 'js/'),
            publicPath: pkg.path.public + 'js/',
            filename: 'app.bundle.js',
        },


        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        cssModules: {
                            camelCase: true,
                        },

                        loaders: {
                            js: [{
                                loader: 'babel-loader',
                                exclude: /node_modules/,
                                options: {
                                    presets: ['latest'],
                                },
                            }, ],

                            // TODO: optimize
                            // https://github.com/vuejs/vue-loader/issues/328#issuecomment-302221120
                            sass: [
                                'style-loader',
                                'css-loader',

                                {
                                    loader: 'sass-loader',
                                    options: {
                                        indentedSyntax: true,
                                        includePaths: [
                                            resolve(__dirname, pkg.path.npm),
                                            resolve(__dirname, pkg.path.build + 'styles'),
                                        ],
                                    },
                                },

                                {
                                    loader: 'sass-resources-loader',
                                    options: {
                                        resources: [
                                            resolve(__dirname, pkg.path.build + 'styles/_setup.scss'),
                                            // resolve(__dirname, pkg.path.npm + 'foundation-sites/scss/foundation.scss'),
                                        ],
                                    },
                                },
                            ],

                            scss: [
                                'style-loader',
                                'css-loader',

                                {
                                    loader: 'sass-loader',
                                    options: {
                                        includePaths: [
                                            resolve(__dirname, pkg.path.npm),
                                            resolve(__dirname, pkg.path.build + 'styles'),
                                        ],
                                    },
                                },

                                {
                                    loader: 'sass-resources-loader',
                                    options: {
                                        resources: [
                                            resolve(__dirname, pkg.path.build + 'styles/_setup.scss'),
                                            // resolve(__dirname, pkg.path.npm + 'foundation-sites/scss/foundation.scss'),
                                        ],
                                    },
                                },
                            ],
                        },


                        postcss: (function() {
                            let plugins = [
                                // require('postcss-import')({
                                //     addDependencyTo: Webpack
                                // }),

                                require('autoprefixer')({
                                    browsers: ['last 4 version']
                                }),
                            ];

                            if (isProduction) {
                                plugins.push(require('cssnano')({
                                    safe: true,
                                    preset: ['default', {
                                        zindex: false,
                                    }],
                                }));
                            }

                            return plugins;
                        })(),
                    }
                },

                // {
                //     test: /\.scss$/,
                //     use: [{
                //         loader: "style-loader"
                //     }, {
                //         loader: "css-loader"
                //     }, {
                //         loader: "sass-loader",
                //         options: {
                //             includePaths: [resolve(__dirname, pkg.path.build + 'styles')]
                //         }
                //     }]
                // },

                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    options: {
                        presets: ['latest'],
                    }
                },

                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                    }
                },

                {
                    test: /\.(png|jpe?g|gif)(\?.*)?$/,
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                    }
                },
            ],
        },


        plugins: [
            new Webpack.DefinePlugin({
                'PRODUCTION': JSON.stringify(isProduction)
            }),
        ],


        resolve: {
            extensions: ['.js', '.json', '.css', '.vue', '.scss'],
            // modulesDirectories: [ "node_modules"],
            modules: [
                resolve(__dirname, pkg.path.npm),
                resolve(__dirname, pkg.path.build + 'scripts/'),
                resolve(__dirname, pkg.path.assets + 'images/')
            ],

            alias: {
                vue: 'vue/dist/vue.js',
                'TweenLite': resolve(__dirname, './_src/scripts/vendor/gsap/TweenLite.js'),
                'TweenMax': resolve(__dirname, './_src/scripts/vendor/gsap/TweenMax.js'),
                'TimelineLite': resolve(__dirname, './_src/scripts/vendor/gsap/TimelineLite.js'),
                'TimelineMax': resolve(__dirname, './_src/scripts/vendor/gsap/TimelineMax.js'),
                'animationGsap': resolve(__dirname, './_src/vendor/gsap/animationgsap.js'),
                'ScrollMagic': resolve(__dirname, pkg.path.npm+'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
                'animation.gsap': resolve(__dirname, pkg.path.npm+'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
                'addIndicators': resolve(__dirname, pkg.path.npm+'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'),
                'zingtouch': resolve(__dirname, pkg.path.npm+'zingtouch/src/ZingTouch.js')
            }
        },

        devServer: {
            host: '0.0.0.0',
            historyApiFallback: true,
            port: 3030,
            compress: true,
            watchOptions: {
                ignored: resolve(__dirname, pkg.path.npm),
            },
            proxy: {
                '/api/': {
                    target: 'http://staging.level2d.com/',
                    changeOrigin: true,
                },
                '/ajax/': {
                    target: 'http://staging.level2d.com/',
                    changeOrigin: true,
                }

            }
        },
    };


    if (isProduction) {
        console.log('[build:production] Start');
        config.plugins.push(
            new Webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            }),

            new Webpack.optimize.UglifyJsPlugin({
                beautify: false,
                comments: false,
                minimize: true,
                compress: {
                    screw_ie8: true
                },
                mangle: {
                    screw_ie8: true,
                    keep_fnames: true
                },
            })
        );
    }

    return config;
};