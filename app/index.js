// var react=require('react');
//一般js的写法
import React from 'react';
//es6的写法
import { render } from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Root from './root'
console.log(React.version);
render(
	<AppContainer>
		<Root/>
	</AppContainer>,
	document.getElementById('root')
);

if(module.hot){
	module.hot.accept('./root',() =>{
		const NewRoot=require('./root').default;
		render(
			<AppContainer>
				<NewRoot/>
			</AppContainer>,
			document.getElementById('root')
		)
	})
}