/* ============================================================
   data.js — 全局模拟数据底座 (Mock Data Layer)
   所有页面共享 window.DB 中的结构化数据
   ============================================================ */
window.DB = (function () {

  /* ---------- 角色 ---------- */
  const roles = [
    { id: 'owner',    name: '机构负责人', short: '负', color: '#3b5bdb', desc: '经营驾驶舱 · 收入与产能', goal: '看清客户池、收入预测、交付质量和团队效率' },
    { id: 'sales',    name: '销售 / BD',  short: '销', color: '#0ca678', desc: '找高潜企业 · 促成签约', goal: '找到高潜企业并促成签约' },
    { id: 'consultant', name: '顾问 / 项目经理', short: '顾', color: '#7048e8', desc: '需求转任务 · 托管计划', goal: '把客户需求转成可执行任务' },
    { id: 'writer',   name: '撰写 / 交付', short: '写', color: '#1098ad', desc: '材料生产 · 版本管理', goal: '高质量完成材料生产' },
    { id: 'expert',   name: '专家',        short: '专', color: '#f08c00', desc: '质量背书 · 关键复核', goal: '把控关键结论和质量背书' },
    { id: 'client',   name: '企业客户',    short: '企', color: '#e8590c', desc: '补充资料 · 查看进度', goal: '获得清晰成长路径和可执行服务' },
  ];

  /* ---------- 企业池 ---------- */
  const stageColors = { '初创期':'cyan', '成长期':'teal', '成熟期':'primary', '扩张期':'purple' };
  const enterprises = [
    { id:'E001', name:'云栖智能科技有限公司', code:'91330106MA2xxxx01', logo:'云', color:'#3b5bdb', region:'浙江·杭州', industry:'人工智能', scale:'120人', stage:'成长期', status:'托管中',
      score:92, potential:'高', techAttr:'AI算法/计算机视觉', revenue:'8600万', rd:'1240万', patents:23, softCopyrights:18, funding:'A+轮',
      contact:'王启明', contactRole:'CTO', phone:'138****6621', tags:['国高企','专精特新','AI核心'], gaps:['研发费用归集不规范','缺少PCT专利'], opportunities:['专精特新申报','研发费用加计扣除'],
      health:88, owner:'李明（销售）', consultant:'张衡（顾问）', lastActive:'2026-06-12', risk:'低' },
    { id:'E002', name:'恒瑞医疗器械股份有限公司', code:'91320100MA1xxxx02', logo:'恒', color:'#0ca678', region:'江苏·南京', industry:'医疗器械', scale:'340人', stage:'成熟期', status:'托管中',
      score:88, potential:'高', techAttr:'高端医疗影像设备', revenue:'3.2亿', rd:'3800万', patents:67, softCopyrights:12, funding:'已上市(科创板)',
      contact:'陈立', contactRole:'董秘', phone:'139****8842', tags:['上市企业','国高企','重点客户'], gaps:['创新平台资质待补'], opportunities:['省级技术中心认定','重大科技专项'],
      health:94, owner:'赵雷（销售）', consultant:'张衡（顾问）', lastActive:'2026-06-14', risk:'低' },
    { id:'E003', name:'微岩新材料有限公司', code:'91510100MA6xxxx03', logo:'微', color:'#7048e8', region:'四川·成都', industry:'新材料', scale:'68人', stage:'成长期', status:'商机推进',
      score:79, potential:'高', techAttr:'石墨烯复合材料', revenue:'5200万', rd:'780万', patents:14, softCopyrights:5, funding:'天使轮',
      contact:'刘洋', contactRole:'总经理', phone:'135****2218', tags:['潜力客户','新材料'], gaps:['知识产权数量不足','财务规范度待提升'], opportunities:['高新技术企业认定','科技型中小企业'],
      health:72, owner:'李明（销售）', consultant:'-', lastActive:'2026-06-10', risk:'中' },
    { id:'E004', name:'智驰新能源汽车科技公司', code:'91440300MA5xxxx04', logo:'智', color:'#e8590c', region:'广东·深圳', industry:'新能源汽车', scale:'520人', stage:'扩张期', status:'托管中',
      score:90, potential:'高', techAttr:'三电系统/智能驾驶', revenue:'6.8亿', rd:'9200万', patents:128, softCopyrights:44, funding:'C轮',
      contact:'黄伟', contactRole:'研发副总', phone:'137****9930', tags:['国高企','专精特新小巨人','战略客户'], gaps:[], opportunities:['国家级专精特新','技术创新示范企业'],
      health:91, owner:'赵雷（销售）', consultant:'孙琪（顾问）', lastActive:'2026-06-13', risk:'低' },
    { id:'E005', name:'数联云软件技术有限公司', code:'91110108MA0xxxx05', logo:'数', color:'#1098ad', region:'北京·海淀', industry:'软件开发', scale:'95人', stage:'成长期', status:'摸排中',
      score:74, potential:'中', techAttr:'工业软件/SaaS', revenue:'4100万', rd:'620万', patents:6, softCopyrights:38, funding:'Pre-A轮',
      contact:'周婷', contactRole:'COO', phone:'186****4417', tags:['软件','SaaS'], gaps:['发明专利偏少','研发立项不规范'], opportunities:['高新技术企业认定','中关村高新'],
      health:65, owner:'李明（销售）', consultant:'-', lastActive:'2026-06-09', risk:'中' },
    { id:'E006', name:'青松生物医药有限公司', code:'91350200MA3xxxx06', logo:'青', color:'#0ca678', region:'福建·厦门', industry:'生物医药', scale:'210人', stage:'成长期', status:'潜在标的',
      score:81, potential:'高', techAttr:'创新药研发', revenue:'1.1亿', rd:'4200万', patents:31, softCopyrights:3, funding:'B轮',
      contact:'林楠', contactRole:'CEO', phone:'159****7733', tags:['生物医药','高研发投入'], gaps:['暂未接触'], opportunities:['重大新药创制','省级工程中心'],
      health:0, owner:'-', consultant:'-', lastActive:'-', risk:'未知' },
    { id:'E007', name:'锐捷半导体科技公司', code:'91440300MA7xxxx07', logo:'锐', color:'#3b5bdb', region:'广东·广州', industry:'集成电路', scale:'160人', stage:'成长期', status:'潜在标的',
      score:85, potential:'高', techAttr:'功率半导体芯片', revenue:'9800万', rd:'1800万', patents:42, softCopyrights:9, funding:'B+轮',
      contact:'吴峰', contactRole:'副总裁', phone:'133****5566', tags:['集成电路','卡脖子技术'], gaps:['暂未接触'], opportunities:['专精特新小巨人','集成电路专项'],
      health:0, owner:'-', consultant:'-', lastActive:'-', risk:'未知' },
    { id:'E008', name:'绿源环保装备有限公司', code:'91370200MA4xxxx08', logo:'绿', color:'#0ca678', region:'山东·青岛', industry:'节能环保', scale:'88人', stage:'成长期', status:'待培育',
      score:68, potential:'中', techAttr:'工业废水处理装备', revenue:'3600万', rd:'410万', patents:9, softCopyrights:4, funding:'未融资',
      contact:'郑强', contactRole:'总经理', phone:'138****1199', tags:['环保装备','待培育'], gaps:['研发投入偏低','知识产权待积累'], opportunities:['科技型中小企业','高企培育入库'],
      health:40, owner:'李明（销售）', consultant:'-', lastActive:'2026-05-28', risk:'中' },
  ];

  /* ---------- 商机 ---------- */
  const oppStages = [
    { id:'lead',     name:'线索',     color:'#1098ad', enter:'企业被推送或导入，尚未有效沟通', action:'生成触达话术，分配负责人，设定首触达时间', exit:'完成有效沟通后转入已摸排' },
    { id:'surveyed', name:'已摸排',   color:'#7048e8', enter:'企业需求、预算、时间窗口初步明确', action:'生成诊断摘要和推荐服务产品', exit:'客户表达明确兴趣后转入方案中' },
    { id:'proposal', name:'方案中',   color:'#3b5bdb', enter:'需要报价、方案或项目规划', action:'AI生成客户服务方案、合同范围和报价建议', exit:'客户认可服务范围后转入谈判' },
    { id:'negotiate',name:'谈判',     color:'#f08c00', enter:'价格、交付边界、结果承诺、付款方式待确认', action:'跟进提醒、异议处理话术、风险条款提示', exit:'签约后进入托管/订单' },
    { id:'won',      name:'赢单',     color:'#0ca678', enter:'完成合同或下单', action:'自动生成托管档案、项目计划和交付任务', exit:'进入交付状态' },
    { id:'lost',     name:'输单/搁置',color:'#868e96', enter:'客户暂不采购或竞争失败', action:'沉淀失败原因，设定再激活时间', exit:'触发新政策、新资质窗口或企业动态后再激活' },
  ];
  const opportunities = [
    { id:'OPP01', ent:'微岩新材料有限公司', entId:'E003', stage:'proposal', amount:'18万', prob:60, owner:'李明', product:'高企申报+研发托管', next:'2026-06-18 发送服务方案', updated:'2026-06-12', source:'潜客推送', note:'客户对高企申报意向明确，关注研发费用归集' },
    { id:'OPP02', ent:'数联云软件技术有限公司', entId:'E005', stage:'surveyed', amount:'12万', prob:40, owner:'李明', product:'高企申报', next:'2026-06-16 二次电话沟通', updated:'2026-06-11', source:'园区名单', note:'已完成摸排，需补充发明专利规划建议' },
    { id:'OPP03', ent:'青松生物医药有限公司', entId:'E006', stage:'lead', amount:'25万', prob:20, owner:'赵雷', product:'省级工程中心+重大专项', next:'2026-06-15 首次触达', updated:'2026-06-10', source:'潜客推送', note:'高研发投入企业，适合高价值项目组合' },
    { id:'OPP04', ent:'锐捷半导体科技公司', entId:'E007', stage:'lead', amount:'30万', prob:25, owner:'赵雷', product:'专精特新小巨人', next:'2026-06-17 首次触达', updated:'2026-06-13', source:'潜客推送', note:'卡脖子技术企业，政府关注度高' },
    { id:'OPP05', ent:'绿源环保装备有限公司', entId:'E008', stage:'negotiate', amount:'9.8万', prob:70, owner:'李明', product:'科技型中小企业+高企培育', next:'2026-06-15 确认报价', updated:'2026-06-14', source:'机构自有名单', note:'价格基本确认，待签约' },
    { id:'OPP06', ent:'晨曦物联网科技公司', entId:'E009', stage:'won', amount:'22万', prob:100, owner:'赵雷', product:'年度政策托管+专精特新', next:'已签约，生成托管档案', updated:'2026-06-08', source:'客户转介绍', note:'已签约，进入托管交付' },
    { id:'OPP07', ent:'天工精密制造有限公司', entId:'E010', stage:'lost', amount:'15万', prob:0, owner:'李明', product:'高企申报', next:'2026-09 政策窗口再激活', updated:'2026-05-30', source:'园区名单', note:'客户选择竞品，价格因素，9月高企季再激活' },
  ];

  /* ---------- 政策 / 项目库 ---------- */
  const policies = [
    { id:'P001', name:'国家高新技术企业认定', level:'国家级', dept:'科技部火炬中心', deadline:'2026-08-15', daysLeft:61, status:'申报中',
      support:'所得税减按15% + 地方奖励50-100万', match:46, tags:['减税','资质','高价值'],
      conditions:['成立满1年','知识产权≥1项核心','研发费用占比达标','高新收入占比≥60%','科技人员占比≥10%'],
      scoreRules:'知识产权30分 + 科技成果转化30分 + 研发组织管理20分 + 成长性20分', materials:['企业基本情况表','知识产权证明','研发费用专项审计','高新收入专项审计','科技人员名单'] },
    { id:'P002', name:'专精特新"小巨人"企业', level:'国家级', dept:'工信部', deadline:'2026-07-20', daysLeft:35, status:'申报中',
      support:'最高300万奖励 + 优先政策支持', match:23, tags:['梯度培育','高含金量'],
      conditions:['专业化程度高','主营业务收入占比≥70%','近2年研发投入占比达标','细分市场占有率领先','发明专利≥5项'],
      scoreRules:'专精特新指标 + 创新能力 + 经济效益 + 细分领域地位', materials:['申报书','财务报表','专利清单','市场地位证明','研发项目证明'] },
    { id:'P003', name:'科技型中小企业评价入库', level:'国家级', dept:'科技部', deadline:'2026-12-31', daysLeft:199, status:'常年受理',
      support:'研发费用加计扣除100% + 入库证明', match:67, tags:['入门资质','加计扣除'],
      conditions:['职工总数≤500人','年销售收入≤2亿','资产总额≤2亿','科技人员占比≥10%','研发费用占比达标'],
      scoreRules:'科技人员指标 + 研发投入指标 + 科技成果指标(满60分入库)', materials:['评价工作指引自评表','研发费用辅助账','科技人员证明'] },
    { id:'P004', name:'省级企业技术中心认定', level:'省级', dept:'省工信厅', deadline:'2026-09-30', daysLeft:107, status:'申报中',
      support:'省级资质 + 项目优先 + 最高200万', match:18, tags:['创新平台','省级'],
      conditions:['研发投入强度达标','研发人员数量达标','研发设备原值达标','近3年新产品收入占比'],
      scoreRules:'创新投入 + 创新条件 + 创新绩效 + 创新效益', materials:['技术中心申请报告','财务审计报告','研发设备清单','创新成果证明'] },
    { id:'P005', name:'创新型中小企业评价', level:'省级', dept:'省工信厅', deadline:'2026-10-15', daysLeft:122, status:'常年受理',
      support:'专精特新培育基础资质', match:54, tags:['梯度培育','基础'],
      conditions:['创新能力评价达标','成长性评价达标','专业化评价达标'],
      scoreRules:'创新能力40分 + 成长性30分 + 专业化30分(满60分)', materials:['自评表','知识产权证明','研发投入证明'] },
    { id:'P006', name:'重大科技专项-关键技术攻关', level:'省级', dept:'省科技厅', deadline:'2026-07-10', daysLeft:25, status:'申报中',
      support:'最高500万项目经费支持', match:8, tags:['项目经费','高难度'],
      conditions:['承担单位资质要求','研发团队实力','技术方案先进性','配套资金能力'],
      scoreRules:'技术先进性 + 团队能力 + 实施方案 + 预期成效', materials:['项目可行性研究报告','技术方案','预算书','合作协议'] },
  ];

  /* ---------- 任务 ---------- */
  const taskStates = [
    { id:'pending',   name:'待派发',     color:'gray',   meaning:'任务已生成但未指定责任人', actions:['派发','合并','取消','调整截止日期'] },
    { id:'todo',      name:'待执行',     color:'cyan',   meaning:'责任人已确认，尚未开始', actions:['开始','退回','请求资料'] },
    { id:'doing',     name:'进行中',     color:'primary',meaning:'正在收集资料、撰写或复核', actions:['上传附件','AI生成','提交评审','延期申请'] },
    { id:'client',    name:'待客户确认', color:'amber',  meaning:'需要客户补充资料或确认事实', actions:['发送客户','催办','标记风险'] },
    { id:'expert',    name:'待专家复核', color:'purple', meaning:'已完成初稿或AI评审，需要专家意见', actions:['分配专家','查看意见','修改'] },
    { id:'done',      name:'已完成',     color:'teal',   meaning:'任务验收通过并归档', actions:['归档','生成下一任务','进入结算'] },
    { id:'exception', name:'异常',       color:'red',    meaning:'逾期、资料缺失、客户不配合或风险不可控', actions:['升级负责人','调整项目','暂停交付'] },
  ];
  const tasks = [
    { id:'T001', title:'云栖智能-专精特新申报书撰写', ent:'云栖智能科技', type:'撰写任务', state:'doing', owner:'陈思（撰写）', due:'2026-06-25', priority:'高', progress:55, project:'专精特新申报' },
    { id:'T002', title:'微岩新材料-摸排访谈', ent:'微岩新材料', type:'摸排任务', state:'todo', owner:'李明（销售）', due:'2026-06-16', priority:'高', progress:0, project:'-' },
    { id:'T003', title:'恒瑞医疗-研发费用专项审计资料收集', ent:'恒瑞医疗器械', type:'资料任务', state:'client', owner:'张衡（顾问）', due:'2026-06-18', priority:'中', progress:70, project:'省级技术中心' },
    { id:'T004', title:'智驰新能源-高企复审材料专家复核', ent:'智驰新能源', type:'评审任务', state:'expert', owner:'郑博士（专家）', due:'2026-06-17', priority:'高', progress:90, project:'高企复审' },
    { id:'T005', title:'数联云-发明专利布局建议', ent:'数联云软件', type:'诊断任务', state:'pending', owner:'-', due:'2026-06-20', priority:'中', progress:0, project:'-' },
    { id:'T006', title:'绿源环保-科技型中小企业自评表', ent:'绿源环保装备', type:'撰写任务', state:'done', owner:'陈思（撰写）', due:'2026-06-10', priority:'低', progress:100, project:'科技型中小企业' },
    { id:'T007', title:'晨曦物联-高企研发费用归集表', ent:'晨曦物联网', type:'撰写任务', state:'exception', owner:'王磊（撰写）', due:'2026-06-12', priority:'高', progress:30, project:'高企申报', exceptionReason:'客户研发台账缺失，资料逾期未提供' },
    { id:'T008', title:'云栖智能-可行性研究报告', ent:'云栖智能科技', type:'撰写任务', state:'doing', owner:'陈思（撰写）', due:'2026-06-28', priority:'中', progress:35, project:'研发专项' },
  ];

  /* ---------- 服务产品 SKU ---------- */
  const serviceProducts = [
    { id:'SKU-H01', name:'年度政策托管服务', cat:'托管类', price:'5.8万/年', delivery:'月度监控 + 季度诊断 + 任务跟进', settle:'年费 + 增值项目费', roles:['顾问','撰写'], duration:'12个月', sales:42, margin:'68%',
      desc:'持续监控政策、企业动态、项目窗口，提供申报日历、机会提醒和年度托管计划' },
    { id:'SKU-H02', name:'资质培育托管', cat:'托管类', price:'8.6万/年', delivery:'月度监控 + 季度诊断 + 任务跟进', settle:'年费 + 增值项目费', roles:['顾问','撰写','专家'], duration:'12个月', sales:28, margin:'62%',
      desc:'围绕高企、专精特新等资质路径，制定梯度培育计划与缺口补齐任务' },
    { id:'SKU-A01', name:'高新技术企业申报', cat:'申报类', price:'3.8万 + 成功奖励', delivery:'项目制交付 + AI材料生产 + 专家复核', settle:'固定服务费 + 成功奖励', roles:['顾问','撰写','专家'], duration:'3-4个月', sales:86, margin:'55%',
      desc:'全流程高企申报服务，含资格诊断、材料生产、专家复核和申报跟进' },
    { id:'SKU-A02', name:'专精特新"小巨人"申报', cat:'申报类', price:'6.5万 + 成功奖励', delivery:'项目制交付 + AI材料生产 + 专家复核', settle:'固定服务费 + 成功奖励', roles:['顾问','撰写','专家'], duration:'4-5个月', sales:24, margin:'58%',
      desc:'专精特新梯度培育与小巨人申报，含细分市场地位论证' },
    { id:'SKU-D01', name:'企业成长诊断', cat:'诊断类', price:'8800元/次', delivery:'AI初诊 + 顾问解读 + 报告输出', settle:'单次购买或作为获客产品', roles:['顾问'], duration:'5个工作日', sales:115, margin:'72%',
      desc:'基于企业画像的成长阶段诊断，输出政策机会与资质路径建议' },
    { id:'SKU-D02', name:'研发费用诊断', cat:'诊断类', price:'6800元/次', delivery:'AI初诊 + 顾问解读 + 报告输出', settle:'单次购买', roles:['顾问'], duration:'5个工作日', sales:67, margin:'70%',
      desc:'研发费用归集合规性诊断，输出加计扣除优化建议' },
    { id:'SKU-E01', name:'专家技术先进性论证', cat:'专家类', price:'1.2万/次', delivery:'按专家、时长、成果交付计费', settle:'订单分成或专家服务费', roles:['专家'], duration:'3个工作日', sales:38, margin:'45%',
      desc:'资深专家对技术先进性、创新性进行论证背书' },
    { id:'SKU-E02', name:'商业计划书精修 + 路演辅导', cat:'专家类', price:'2.8万', delivery:'按专家、时长、成果交付计费', settle:'订单分成或专家服务费', roles:['专家'], duration:'7个工作日', sales:16, margin:'48%',
      desc:'融资材料精修与路演辅导，提升融资成功率' },
    { id:'SKU-T01', name:'政策订阅 + 项目日历', cat:'工具类', price:'2980元/席/年', delivery:'SaaS功能订阅', settle:'按席位/企业数/调用量', roles:[], duration:'年度', sales:230, margin:'85%',
      desc:'政策实时订阅、项目申报日历、智能匹配提醒' },
    { id:'SKU-T02', name:'AI问答席位', cat:'工具类', price:'1980元/席/年', delivery:'SaaS功能订阅', settle:'按席位/调用量', roles:[], duration:'年度', sales:180, margin:'88%',
      desc:'AI客户顾问问答席位，支持政策、申报、研发等专业问答' },
  ];

  /* ---------- 智能体 ---------- */
  const agents = [
    { id:'AG1', name:'企业画像 Agent', icon:'🏢', color:'#3b5bdb', duty:'整合企业数据并判断成长阶段',
      inputs:['工商','财务','研发','知识产权','融资','动态'], outputs:['企业画像','标签','评分','风险','待核验问题'],
      review:'顾问确认关键事实', risk:'数据过期或误识别', calls:'12.4k', accuracy:'91%' },
    { id:'AG2', name:'政策项目 Agent', icon:'📋', color:'#0ca678', duty:'匹配政策、项目和资质路径',
      inputs:['企业画像','政策库','项目规则','区域信息'], outputs:['项目匹配分','申报日历','缺口任务'],
      review:'顾问确认适用性', risk:'误判申报资格', calls:'9.8k', accuracy:'88%' },
    { id:'AG3', name:'客户顾问 Agent', icon:'💬', color:'#7048e8', duty:'回答专业问题并生成客户服务方案',
      inputs:['对话','诊断结果','服务产品库','案例库'], outputs:['专业问答','方案','报价建议','服务组合'],
      review:'负责人确认边界和价格', risk:'交付范围不清', calls:'15.2k', accuracy:'86%' },
    { id:'AG4', name:'销售助手 Agent', icon:'📞', color:'#1098ad', duty:'在对话中推荐服务产品并生成话术',
      inputs:['商机阶段','客户痛点','历史沟通'], outputs:['触达话术','异议处理','下一步建议','产品推荐'],
      review:'销售发送前确认', risk:'过度承诺或表达不当', calls:'18.6k', accuracy:'89%' },
    { id:'AG5', name:'材料撰写 Agent', icon:'✍️', color:'#e8590c', duty:'分模块生成申报材料',
      inputs:['企业素材','模板','项目规则','章节要求'], outputs:['章节初稿','补充问题','附件引用'],
      review:'撰写人员和专家复核', risk:'编造事实或引用错误', calls:'7.3k', accuracy:'83%' },
    { id:'AG6', name:'评审 Agent', icon:'🔍', color:'#f08c00', duty:'完成AI初评和风险识别',
      inputs:['材料','附件','规则','评分模型'], outputs:['评分','问题定位','修改建议','专家复核建议'],
      review:'专家复核关键结论', risk:'评分偏差或漏判', calls:'5.1k', accuracy:'85%' },
    { id:'AG7', name:'运营结算 Agent', icon:'💰', color:'#364fc7', duty:'跟进订单、派单、状态和结算',
      inputs:['订单','合同','任务','交付结果','分成规则'], outputs:['派单建议','逾期提醒','结算清单','毛利分析'],
      review:'负责人确认结算', risk:'结算口径错误', calls:'4.2k', accuracy:'94%' },
  ];

  /* ---------- 评审 ---------- */
  const reviews = [
    { id:'RV01', target:'云栖智能-专精特新申报书', type:'AI竞争力评审', score:78, status:'已出具', expert:'-', date:'2026-06-13',
      issues:[ {level:'高',text:'细分市场占有率缺少第三方数据支撑'}, {level:'中',text:'研发投入占比表述与财务数据不一致'}, {level:'低',text:'部分技术术语需统一'} ] },
    { id:'RV02', target:'智驰新能源-高企复审材料', type:'专家评审', score:91, status:'待专家确认', expert:'郑博士', date:'2026-06-14',
      issues:[ {level:'中',text:'高新收入归集口径需复核'}, {level:'低',text:'知识产权与产品对应关系建议补充说明'} ] },
    { id:'RV03', target:'绿源环保-科技型中小企业自评', type:'AI合规评审', score:85, status:'通过', expert:'-', date:'2026-06-10',
      issues:[ {level:'低',text:'科技人员名单缺少社保证明附件'} ] },
  ];

  /* ---------- 提醒 / 通知 ---------- */
  const notifications = [
    { type:'政策', icon:'📋', color:'#0ca678', title:'专精特新"小巨人"申报截止前35天', desc:'2家托管企业符合条件，建议启动材料生产', time:'10分钟前' },
    { type:'动态', icon:'📈', color:'#3b5bdb', title:'恒瑞医疗完成新一轮融资', desc:'触发式跟进机会：可推荐省级技术中心申报', time:'2小时前' },
    { type:'任务', icon:'⚠️', color:'#e03131', title:'晨曦物联高企材料任务逾期', desc:'客户研发台账缺失，需升级处理', time:'5小时前' },
    { type:'商机', icon:'💡', color:'#7048e8', title:'绿源环保进入谈判阶段', desc:'报价已确认，建议尽快推进签约', time:'1天前' },
    { type:'评审', icon:'🔍', color:'#f08c00', title:'智驰新能源材料待专家复核', desc:'AI评审已完成，等待郑博士确认', time:'1天前' },
  ];

  return {
    roles, enterprises, opportunities, oppStages, policies, tasks, taskStates,
    serviceProducts, agents, reviews, notifications, stageColors,
    // 便捷查询
    getEnterprise: (id) => enterprises.find(e => e.id === id),
    getAgent: (id) => agents.find(a => a.id === id),
  };
})();
