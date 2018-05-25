import React from 'react';
import Header from './components/header';
import Player from './page/player';
import MusicList from './page/musiclist.js';
import {MUSIC_LIST} from './config/musiclist';
import {Router,IndexRoute,Link,Route,hashHistory} from 'react-router';
import Pubsub from 'pubsub-js'


let App=React.createClass({
	getInitialState(){
		return{
			musicList:MUSIC_LIST,
			currentMusicItem:MUSIC_LIST[3]
		}
	},	
	playMusic(musicItem){
		$('#player').jPlayer('setMedia',{
			mp3:musicItem.file
		}).jPlayer('play');

		this.setState({
			currentMusicItem:musicItem
		})
	},
	playNext(type="next"){
		let index = this.findMusicIndex(this.state.currentMusicItem);
		let newIndex=null;
		let musicListLength=this.state.musicList.length;
		if(type==='next'){
			//当当前播放的歌曲已经是最后一首的时候，为防止播放溢出，所以代码做如下处理
			//如果总共有5首歌，前4首播放时，播放没有问题，地5首播放时，（5+1）%5  余1，相当于自动又播放第一首，这是一个很巧妙的处理方法
			newIndex=(index+1)%musicListLength;
		}else{
			//为防止newIndex出现负值
			newIndex=(index-1+musicListLength)%musicListLength;
		}
		this.playMusic(this.state.musicList[newIndex]);
	},
	//遵循don't repeat yourselt
	findMusicIndex(musicItem){
		return this.state.musicList.indexOf(musicItem);
	},
	componentDidMount(){
		$('#player').jPlayer({
			supplied:'mp3',
			wmode:'window'
		});
		//调用playMusic函数播放第一首音乐
		this.playMusic(this.state.currentMusicItem);

		//当音乐播放完之后，判断音乐的播放模式，是单曲循环还是顺序播放，还是随机播放
		$('#player').bind($.jPlayer.event.ended,(e)=>{
			this.playNext();
		});

		//设置订阅器订阅删除音乐
		Pubsub.subscribe('DELETE_MUSIC',(msg,musicItem)=>{
			this.setState({
				musicList:this.state.musicList.filter(item=>{
					return item!==musicItem;
				})
			})
		});
		//设置订阅器订阅播放音乐
		Pubsub.subscribe('PLAY_MUSIC',(msg,musicItem)=>{
			this.playMusic(musicItem);
		});
		//设置订阅器订阅播放下一首音乐
		Pubsub.subscribe('PLAY_NEXT',(msg,musicItem)=>{
			this.playNext();
		});
		//设置订阅器订阅播放上一首音乐
		Pubsub.subscribe('PLAY_PREV',(msg,musicItem)=>{
			this.playNext('prev');
		});		
	},
	componentWillUnMount(){
		//解绑播放音乐订阅器
		Pubsub.unsubscribe('PLAY_MUSIC');
		//解绑删除音乐订阅器
		Pubsub.unsubscribe('DELETE_MUSIC');
		//解绑音乐播放结束事件
		$('#player').unbind($.jPlayer.event.ended);
		//解绑播放下一首订阅器
		Pubsub.unsubscribe('PLAY_NEXT');
		//解绑播放上一首订阅器
		Pubsub.unsubscribe('PLAY_PREV');
	},
	render(){
		return (
			<div>
				<Header/>
				{React.cloneElement(this.props.children,this.state)}
			</div>
		)
	}
});


let Root=React.createClass({
	render(){
		return(
			<Router history={hashHistory}>
				<Route path='/' component={App}>
					<IndexRoute component={Player}></IndexRoute>
					<Route path='/list' component={MusicList}></Route>
				</Route>
			</Router>			
		)
	}
});

export default Root;