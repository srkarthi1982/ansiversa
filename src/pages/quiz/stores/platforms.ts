import Alpine from 'alpinejs';
import { actions } from "astro:actions";
type Platform = {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string | null;
  qCount: number;
  isActive: boolean;
};
class Platforms {
    platformList: Platform[] = [];
    page: number = 1;
    pageSize: number = 10;
    constructor() {}
    async getPlatforms(page: number, pageSize: number){
        console.log('page', page)
        Alpine.store('loader').show();
        const { data, error } = await actions.quiz.fetchPlatforms({page, pageSize});
        if(error) console.log('error', error);
        this.platformList = data?.items || [];
        Alpine.store('loader').hide();
    }
}
export type PlatformsStore = Platforms;
Alpine.store('platforms', new Platforms());

