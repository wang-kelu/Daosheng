import { reactive, ref } from "vue";
import type { Dayjs } from "dayjs";
import * as echarts from "echarts";
import { WeiboService } from "../services/index";
import { components } from "../types/petstore";

export type HotWeiboChartList = components["schemas"]["近30天热度走势"];
const UseWeibo = () => {
  let charts: echarts.ECharts | null = null;
  /** 热搜排名 */
  const hotWeibolist = ref<components["schemas"]["热度排名"]>([]);
  /** 热搜走势 */
  const hotWeiboChart = reactive<HotWeiboChartList>({
    date: [],
    list: [],
  });
  /** 词云数据 */
  const wordcloudData = ref<
    {
      value: number;
      name: string;
    }[]
  >([]);

  const getListData = () => {
    const listData = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 23; i++) {
      listData.push({
        index: i,
        isOpen: false,
        isReplyContent: false,
        releaseTime: "2022-03-09 18:00",
        title: `名字 ${i}`,
        avatar: "https://joeschmoe.io/api/v1/random",
        commentValue: "153",
        forwardingValue: "150",
        giveALikeValue: "151",
        content:
          "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
      });
    }
    return listData;
  };
  const listData = reactive(getListData());
  const pagination = {
    onChange: (page: number) => {
      console.log(page);
    },
    total: listData.length,
    // current: 1,
    // defaultPageSize: 3,
    pageSize: 3,
    pageSizeOptions: ["10", "20", "30", "40", "100"],
    defaultCurrent: 1,
    defaultPageSize: 10,
    showQuickJumper: true,
    showSizeChanger: true,
    hideOnSinglePage: true,
  };

  const getWeiboTopMostChart = (date: Dayjs, dom: HTMLElement) => {
    return new Promise<void>((resolve) => {
      if (!charts) {
        charts = echarts.init(dom);
      }
      WeiboService.getWeiboTopMostChart(date.unix().toString()).then((res) => {
        hotWeiboChart.date = res.date;
        hotWeiboChart.list = res.list;
        const option = {
          // animationDuration: 2000,
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: res.date,
          },
          yAxis: {
            type: "value",
          },
          grid: {
            right: 140,
          },
          legend: {
            data: res.list.map((item) => {
              return item.name;
            }),
          },
          series: res.list.map((item) => {
            return {
              ...item,
              type: "line",
              // stack: "Total",
            };
          }),
          dataZoom: [
            {
              type: "inside",
              start: 0,
              end: 20,
            },
            {
              start: 0,
              end: 20,
            },
          ],
        };
        if (charts) {
          charts.setOption(option);
        }
        resolve();
      });
    });
  };
  const getWeiboTopMostList = (date: Dayjs) => {
    WeiboService.getWeiboTopMostList(date.unix().toString()).then((res) => {
      hotWeibolist.value = res;
    });
  };
  const getWordcloudData = async (id: string) => {
    await WeiboService.getWordcloudData(id).then((res) => {
      wordcloudData.value = res;
    });
  };
  /** 查询用户情绪 */
  const getWeiboEmotion = async (id: string) => {
    const res = await await WeiboService.getWeiboEmotion(id);
    return res;
  };
  /** 查询地区情绪 */
  const getWeiboEmotionMap = async (id: string) => {
    const res = await WeiboService.getWeiboEmotionMap(id);
    return res;
  };
  return {
    hotWeibolist,
    hotWeiboChart,
    wordcloudData,
    listData,
    pagination,
    getWordcloudData,
    getWeiboTopMostList,
    getWeiboTopMostChart,
    getWeiboEmotion,
    getWeiboEmotionMap,
  };
};
export default UseWeibo;
