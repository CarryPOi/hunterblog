<template>
  <div class="shell" id="shell" ref="shellRef">
    <div class="header">
      <h2 class="title">猎人日记</h2>
      <h3 class="subtitle">MONSTER HUNTER</h3>
    </div>
    <div class="timeline">
      <div v-for="(item, index) in timelineItems" :key="index" class="item" :data-text="item.dataText">
        <div class="content">
          <img :src="item.img" alt="" class="img" />
          <h2 class="content-title">{{ item.title.replace(/^\d+\./, '') }}</h2>
          <p class="content-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <p style="color: rgba(255, 255, 255, 0.5); font-size: 18px;">— 敬请期待更多记录 —</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const shellRef = ref(null)

// 自动生成的时间轴数据
const timelineItems = [
  { title: '1.搭船', img: new URL('@/assets/timeline/1.搭船.png', import.meta.url).href, dataText: '前往新大陆的船只终于准备出航。', desc: '乘船的行列中，也有第五期调查团中一名猎人的身影。' },
  { title: '2.注意易碎物', img: new URL('@/assets/timeline/2.注意易碎物.png', import.meta.url).href, dataText: '灵巧使用前脚挖掘壶的搔鸟......', desc: '猎人与调查班队长刚抵达营地设置区，看见的是灵巧使用前脚挖掘壶的搔鸟......' },
  { title: '3.横冲直撞的家伙们', img: new URL('@/assets/timeline/3.横冲直撞的家伙们.png', import.meta.url).href, dataText: '回收熔山龙的痕迹', desc: '为了回收熔山龙的痕迹，护卫学者的猎人却在任务途中遇到了土砂龙。' },
  { title: '4.险恶的沼泽', img: new URL('@/assets/timeline/4.险恶的沼泽.png', import.meta.url).href, dataText: '寻找失踪的学者', desc: '为了寻找失踪的学者，猎人来到沼泽，发现学者正因某种物体加害了土砂龙而感到恐惧。' },
  { title: '5.飞雷龙飞舞之森', img: new URL('@/assets/timeline/5.飞雷龙飞舞之森.png', import.meta.url).href, dataText: '灵敏牙龙种的威胁将至', desc: '感觉到火热的气息，仰望天空的猎人周围飘下大量的羽毛。对栖息在树上的灵敏牙龙种的威胁将至.....！' },
  { title: '6.森林暴徒·蛮鄂龙', img: new URL('@/assets/timeline/6.森林暴徒·蛮鄂龙.png', import.meta.url).href, dataText: '路蛮颚龙争夺地盘', desc: '躁对手的展开争夺地盘、路蛮颚龙。为了使它落入陷阱，猎人开尝试诱导.....' },
  { title: '7.熔山龙捕获作战', img: new URL('@/assets/timeline/7.熔山龙捕获作战.png', import.meta.url).href, dataText: '解开古龙迁徙之谜', desc: '调查团拟定捕获古龙的为解开古龙迁徙之谜，作战计划。在阳光照亮大峡谷之时，终于出现了熔山龙的身影。' },
  { title: '8.闪光之主', img: new URL('@/assets/timeline/8.闪光之主.png', import.meta.url).href, dataText: '耀眼的闪光笼罩', desc: '成群对付猎物的猫蜥龙们发现侵入地盘的眩鸟便立即围上。然而周围瞬间被耀眼的闪光笼罩....' },
  { title: '9.浮空的飞龙', img: new URL('@/assets/timeline/9.浮空的飞龙.png', import.meta.url).href, dataText: '追踪缓慢浮游的物体', desc: '猎人追踪着缓慢浮游在空中的可疑物体。但一下就跟丢了环顾周围却发现......' },
  { title: '10.骨战车前往山谷', img: new URL('@/assets/timeline/10.骨战车前往山谷.png', import.meta.url).href, dataText: '巨型骨战车强袭', desc: '正在进行痕迹调查的猎人，听见巨型的地鸣声从地底出现的巨型骨战车强袭而来......！' },
  { title: '11.华丽的天空猎人', img: new URL('@/assets/timeline/11.华丽的天空猎人.png', import.meta.url).href, dataText: '在天空狩猎的风漂龙', desc: '为了寻找熔山龙的痕迹，一行人计划用热气球降落至谷底最下层却遭到在天空狩猎的风漂龙阻拦。' },
  { title: '12.危机', img: new URL('@/assets/timeline/12.危机.png', import.meta.url).href, dataText: '目标锁定在接待员身上', desc: '两人在调查熔山龙的痕迹，惨爪龙却突然出现在面前。惨爪龙的目标锁定在接待员身上......' },
  { title: '13.展翅于森之巅', img: new URL('@/assets/timeline/13.展翅于森之巅.png', import.meta.url).href, dataText: '空之王者火龙', desc: '为了见到古代龙人，两人来到古代树顶端。出现在那里的是愤怒的空之王者火龙。' },
  { title: '14.沙下的狂暴', img: new URL('@/assets/timeline/14.沙下的狂暴.png', import.meta.url).href, dataText: '地底出现两根巨角', desc: '土砂龙将在大蚁家荒地飞舞的响翼龙当成猎物但地底却突然出现两根巨角，让状况为之一变。' },
  { title: '15.神秘王国的女王', img: new URL('@/assets/timeline/15.神秘王国的女王.png', import.meta.url).href, dataText: '寻找留下奇妙痕迹的怪物', desc: '为了寻找留下奇妙的痕迹的怪物，两人造访了陆珊瑚台地出现在那里的是......' },
  { title: '16.那个大胃王', img: new URL('@/assets/timeline/16.那个大胃王.png', import.meta.url).href, dataText: '吞食结晶的岩贼龙', desc: '四面八方铺满巨型结晶的洞窟内岩贼龙默默地吞食着结晶。然而接下来这股食欲找上了猎人。' },
  { title: '17.火中泳动的龙', img: new URL('@/assets/timeline/17.火中泳动的龙.png', import.meta.url).href, dataText: '灼热熔岩沸腾的洞窟', desc: '猎人在灼热熔岩滚动的洞窟内前进，遭遇了激烈业火的袭击。好不容易躲过之后等在前方的究竟是......' },
  { title: '18.危险的车轮', img: new URL('@/assets/timeline/18.危险的车轮.png', import.meta.url).href, dataText: '龙结晶之地的危险车轮', desc: '在龙结晶之地驰骋的危险车轮。带着热气的岩石冲散到四周与猎人的距离逐渐逼近......' },
  { title: '19.出现黑色创伤', img: new URL('@/assets/timeline/19.出现黑色创伤.png', import.meta.url).href, dataText: '古龙·灭尽龙', desc: '通过熔山龙猎人终于和几度发生冲突的对象，吞噬古龙的古龙·灭尽龙面对面了。' },
  { title: '20.钢铁的钢龙', img: new URL('@/assets/timeline/20.钢铁的钢龙.png', import.meta.url).href, dataText: '激烈的龙卷风', desc: '意识凝聚在地面突出的结晶群的瞬间激烈的龙卷风将结晶卷起然后开始袭击猎人。' },
  { title: '21.爆炎的炎王龙', img: new URL('@/assets/timeline/21.爆炎的炎王龙.png', import.meta.url).href, dataText: '激烈业火的袭击', desc: '猎人在灼热熔岩滚动的洞窟内前进，遭遇了激烈业火的袭击。好不容易躲过之后等在前方的究竟是......' },
  { title: '22.冥底的尸套龙', img: new URL('@/assets/timeline/22.冥底的尸套龙.png', import.meta.url).href, dataText: '尸肉怪异地蠢蠢欲动', desc: '群聚吞吃尸肉的痹贼龙们发现猎人接近，天开始威吓。然然而在背后堆积如山的尸肉开始怪异地蠢蠢欲动。' },
  { title: '23.此乃古龙之王', img: new URL('@/assets/timeline/23.此乃古龙之王.png', import.meta.url).href, dataText: '尊为此世之王者', desc: '贪食流转于新大陆的庞大能量后，尊为此世之王者，终于诞生。' },
  { title: '24.贪食的恐暴龙', img: new URL('@/assets/timeline/24.贪食的恐暴龙.png', import.meta.url).href, dataText: '大灾难等待着接待员', desc: '一行人为了调查恐暴龙而造访却有一场大灾难古代树森林，去就在那里等候着接待员......' },
  { title: '25.包覆金色铠甲之物', img: new URL('@/assets/timeline/25.包覆金色铠甲之物.png', import.meta.url).href, dataText: '注入生命的巨大黄金', desc: '绚辉龙在阳光照耀的洞窟里蠢蠢欲动，那身影犹如一块被注入生命的巨大黄金。' },
  { title: '26.伫立于炎王身旁者', img: new URL('@/assets/timeline/26.伫立于炎王身旁者.png', import.meta.url).href, dataText: '对崎的古龙', desc: '在打盹的炎王龙前面，灭尽龙突然现身。就在这两只对崎的古龙互相冲突的瞬间现身的是......' },
  { title: '27.深雪之影', img: new URL('@/assets/timeline/27.深雪之影.png', import.meta.url).href, dataText: '未曾见过的痕迹', desc: '猎人与接待员为寻找热气球降落地点，展开了探索之旅。在抵达一处宽广的区域后，却发现了未曾见过的痕迹。' },
  { title: '28.蒙牛龙的强袭', img: new URL('@/assets/timeline/28.蒙牛龙的强袭.png', import.meta.url).href, dataText: '砍倒的树木挡住道路', desc: '为了确保运输队的安全，猎人前往永霜冻土进行探索。发现前方道路都被砍倒的树木挡住了。' },
  { title: '29.暗中逼近的脚步声', img: new URL('@/assets/timeline/29.暗中逼近的脚步声.png', import.meta.url).href, dataText: '痹毒龙正紧跟着', desc: '在迁徙之地进行调查的原野大师与猎人们的背后，痹毒龙正紧跟着锁定自标，静静地朝猎物逼近。' },
  { title: '30.催眠飞龙', img: new URL('@/assets/timeline/30.催眠飞龙.png', import.meta.url).href, dataText: '强烈的睡意', desc: '猎人为调查亚种而来到大蚁家荒地却无端出现强烈的睡意。在意识蒙胧中看到的是中是......' },
  { title: '31.嗜水之妖', img: new URL('@/assets/timeline/31.嗜水之妖.png', import.meta.url).href, dataText: '水妖鸟丝不为所动', desc: '猫蜥龙包围住入侵领地范围的水妖鸟并进行威吓。但入侵者却丝毫不为所动，继续为所欲为.......' },
  { title: '32.冰冻暴雪之谜', img: new URL('@/assets/timeline/32.冰冻暴雪之谜.png', import.meta.url).href, dataText: '冰冻的翼龙', desc: '为了搜索原野大师和接待员，猎人前往了永霜冻土。.C 却在暴风雪中发现了冰冻的翼龙。' },
  { title: '33.冰之龙', img: new URL('@/assets/timeline/33.冰之龙.png', import.meta.url).href, dataText: '漫天狂舞的风雪', desc: '接待员们顺利与猎人再次见面。才刚确认调查结果没多久，京就传来一阵歌声随之而来的是漫天狂舞的风雪......' },
  { title: '34.迅影', img: new URL('@/assets/timeline/34.迅影.png', import.meta.url).href, dataText: '迅龙袭击火龙', desc: '猎人们前往古代树森林进行调查却遭受迅龙袭击，并遇上突然闯入的火龙。这这场争斗究竟鹿死谁手......' },
  { title: '35.身经百战之刃', img: new URL('@/assets/timeline/35.身经百战之刃.png', import.meta.url).href, dataText: '强大的威胁逼近身后', desc: '雌火龙回到了巢穴疗伤。猎人查看状况的同时，更更强大的威胁也正默默逼近其身后。' },
  { title: '36.回荡山谷的轰响', img: new URL('@/assets/timeline/36.回荡山谷的轰响.png', import.meta.url).href, dataText: '实力之差一目了然', desc: '骨锤龙使出敏捷的旋转与突进，对贪嗜猎物的轰龙展开袭击。然而，两者之间的实力之差却是一目了然。' },
  { title: '37.强酸之刃', img: new URL('@/assets/timeline/37.强酸之刃.png', import.meta.url).href, dataText: '硫斩龙的猛刃', desc: '一群痹贼龙包围着硫斩龙准备展开攻击。最后却被硫斩龙的猛刃打得落花流水。' },
  { title: '37.逼近的黏菌威胁', img: new URL('@/assets/timeline/37.逼近的黏菌威胁.png', import.meta.url).href, dataText: '爆锤龙全身附着黏菌', desc: '猎人留意到龙结晶之地的地面一片焦黑。前方出现的爆锤龙全身都附着黏菌......' },
  { title: '38.捕食者的地盘争夺', img: new URL('@/assets/timeline/38.捕食者的地盘争夺.png', import.meta.url).href, dataText: '杀气腾腾的身影逼近', desc: '为寻找猎物而徘徊在陆珊瑚台地的惨爪龙。正朝猎人们怒目吐气。此时背后传来了咆啸，其他杀气腾腾的身影也同时逼近。' },
  { title: '39.月辰保卫战', img: new URL('@/assets/timeline/39.月辰保卫战.png', import.meta.url).href, dataText: '月辰防卫战的结果', desc: '一定要在击龙杭炮做好发射准备前挡住冰龙的猛攻！月辰防卫战的结果究竟如何......？' },
  { title: '40.雾瘴尸套龙', img: new URL('@/assets/timeline/40.雾瘴尸套龙.png', import.meta.url).href, dataText: '散发异样气氛的森林', desc: '四处飘散瘴气，散发异样气氛的古代树森林。户套龙一边前进，一边喷出瘴气影响周围的一切。' },
  { title: '41.溟海之光', img: new URL('@/assets/timeline/41.溟海之光.png', import.meta.url).href, dataText: '神秘的水流之中', desc: '当猎人看到闪烁虹光的双翼的瞬间被卷入到了神秘的水流之中。苏醒时却看到了......' },
  { title: '42.大自然的力量', img: new URL('@/assets/timeline/42.大自然的力量.png', import.meta.url).href, dataText: '大自然的力量', desc: '在与天地煌啼龙的死斗中胜出后调查团的伙伴们也前来聚集。面对大自然的力量，他们看到的是......' },
  { title: '43.前往聚魔之地', img: new URL('@/assets/timeline/43.前往聚魔之地.png', import.meta.url).href, dataText: '追踪灭尽龙', desc: '猎人们追踪着灭尽龙，然而意外映入眼帘的是充满生物多样性的生命摇篮。' },
  { title: '44.残酷可怕的狮子', img: new URL('@/assets/timeline/44.残酷可怕的狮子.png', import.meta.url).href, dataText: '警戒状态的麒麟', desc: '发现了熔岩地带的猎人们，遇到了正进入警戒状态的麒麟。究竟是什么让它聚精会神紧盯远方......？' },
  { title: '45.冥赤龙再临', img: new URL('@/assets/timeline/45.冥赤龙再临.png', import.meta.url).href, dataText: '灾厄再次降临幽谷', desc: '灾厄再次降临幽谷这块土地的天命，就交给苍蓝星了。' },
  { title: '46.与毁灭对峙', img: new URL('@/assets/timeline/46.与毁灭对峙.png', import.meta.url).href, dataText: '破坏的象征', desc: '寒气进发、火灼热焚身的异色怪物「煌黑龙」。猎人们将与这「破坏的象征」展开对崎。' },
  { title: '47.为了不使世界终结', img: new URL('@/assets/timeline/47.为了不使世界终结.png', import.meta.url).href, dataText: '传承羁绊的动力', desc: '托付之人的心愿传承纶所托之人，共同探索新世界所产生的羁绊，成了促使那名猎人前进的动力。' }
]

const loadJQuery = () => {
  return new Promise((resolve, reject) => {
    if (window.jQuery) {
      resolve(window.jQuery)
      return
    }
    const jq = document.createElement('script')
    jq.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js'
    jq.onload = () => resolve(window.jQuery)
    jq.onerror = reject
    document.body.appendChild(jq)
  })
}

onMounted(async () => {
  try {
    const $ = await loadJQuery()
    
    ;(function ($) {
      $.fn.timeline = function () {
        var selectors = {
          id: $(this),
          item: $(this).find('.item'),
          activeClass: 'item--active',
          img: '.img'
        }
        
        // Initialize first item
        selectors.item.eq(0).addClass(selectors.activeClass)
        const firstImg = selectors.item.first().find(selectors.img).attr('src')
        if (firstImg) {
          selectors.id.css('background-image', 'url(' + firstImg + ')')
        }
        
        var itemLength = selectors.item.length
        
        const onScroll = function () {
          var windowHeight = $(window).height()
          var pos = $(window).scrollTop()
          // 将触发中心点设为屏幕高度的 50% 处，让内容在滚动到中间时激活
          var triggerPoint = pos + windowHeight * 0.5

          selectors.item.each(function (i) {
            var min = $(this).offset().top
            var max = $(this).offset().top + $(this).outerHeight()

            if (triggerPoint >= min && triggerPoint <= max) {
              const currentImg = $(this).find(selectors.img).attr('src')
              if (currentImg) {
                selectors.id.css('background-image', 'url(' + currentImg + ')')
              }
              selectors.item.removeClass(selectors.activeClass)
              $(this).addClass(selectors.activeClass)
            }
          })
        }

        $(window).on('scroll.timeline', onScroll)
        // Trigger once to set initial state
        onScroll()
      }
    })(jQuery)

    if (shellRef.value) {
      $(shellRef.value).timeline()
    }
  } catch (err) {
    console.error('Failed to load jQuery or initialize timeline:', err)
  }
})

onUnmounted(() => {
  if (window.jQuery) {
    window.jQuery(window).off('scroll.timeline')
  }
})
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
.shell {
  width: 100%;
  position: relative;
  padding: 120px 0 500px 0;
  transition: 0.3s ease 0s;
  background-attachment: fixed;
  background-size: cover;
}
.shell:before {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-color);
  opacity: 0.3;
  content: "";
  transition: background-color 0.4s ease;
}
.header {
  width: 100%;
  text-align: center;
  margin-bottom: 80px;
  position: relative;
}
.title {
  color: var(--title-color);
  font-size: 46px;
  font-weight: normal;
  margin: 0;
  transition: color 0.4s ease;
}
.timeline {
  display: flex;
  margin: 0 auto;
  flex-wrap: wrap;
  flex-direction: column;
  max-width: 700px;
  position: relative;
}
.content-title {
  font-weight: bold;
  font-size: 66px;
  margin: -10px 0 0 0;
  transition: 0.4s;
  padding: 0 10px;
  box-sizing: border-box;
  color: var(--text-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
.content-desc {
  margin: 0;
  font-size: 22px;
  box-sizing: border-box;
  color: var(--text-color);
  font-weight: 500;
  line-height: 32px;
  transition: color 0.4s ease;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}
.timeline:before {
  position: absolute;
  left: 50%;
  width: 2px;
  height: 100%;
  margin-left: -1px;
  content: "";
  background: var(--glass-border);
}
.item {
  padding: 40px 0;
  opacity: 0.3;
  filter: blur(2px);
  transition: 0.5s;
  box-sizing: border-box;
  width: calc(50% - 40px);
  display: flex;
  position: relative;
  transform: translateY(-80px);
}
.item:before {
  content: attr(data-text);
  letter-spacing: 3px;
  width: 100%;
  position: absolute;
  color: var(--text-secondary);
  font-size: 18px;
  border-left: 2px solid var(--glass-border);
  top: 70%;
  margin-top: -5px;
  padding-left: 15px;
  opacity: 0;
  right: calc(-100% - 56px);
  font: 900 24px '';
  letter-spacing: 5px;
  transition: all 0.4s ease;
}
.item:nth-child(even) {
  align-self: flex-end;
}
.item:nth-child(even):before {
  right: auto;
  text-align: right;
  left: calc(-100% - 56px);
  padding-left: 0;
  border-left: none;
  border-right: 2px solid var(--glass-border);
  padding-right: 15px;
}
.item--active {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0px);
}
.item--active:before {
  top: 50%;
  transition: 0.3s all 0.2s;
  opacity: 1;
}
.item--active .content-title {
  margin: -50px 0 20px 0;
}
.img {
  max-width: 100%;
  box-shadow: var(--card-shadow);
}
.subtitle {
  color: var(--text-secondary);
  font-size: 22px;
  letter-spacing: 5px;
  margin: 10px 0 0 0;
  font-weight: normal;
  transition: color 0.4s ease;
}
.footer {
  padding: 95px 0;
  text-align: center;
}
.footer a {
  color: var(--text-secondary);
  display: inline-block;
}
@media only screen and (max-width: 767px) {
  .item {
    align-self: baseline !important;
    width: 100%;
    padding: 0 30px 150px 80px;
  }
  .item:before {
    left: 10px !important;
    padding: 0 !important;
    top: 50px;
    text-align: center !important;
    width: 60px;
    border: none !important;
  }
  .item:last-child {
    padding-bottom: 40px;
  }
}
@media only screen and (max-width: 767px) {
  .timeline:before {
    left: 40px;
  }
}
</style>
