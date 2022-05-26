import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeroesComponent } from "./heroes.component";
import { Component, Directive, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { HeroService } from "../hero.service";
import { of } from "rxjs";
import { Hero } from "../hero";
import { By } from "@angular/platform-browser";
import { HeroComponent } from "../hero/hero.component";

@Directive({
  selector: "[routerLink]",
  host: { "(click)": "onClick()" },
})
export class RouterLinkDirectiveStub {
  @Input("routerLink") linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}

describe("HeroesComponent (deep tests)", () => {
  let fixture: ComponentFixture<HeroesComponent>;
  let mockHeroService;
  let HEROES;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: "Luffy", strenght: 10 },
      { id: 2, name: "Zorro", strenght: 9 },
      { id: 3, name: "Sanji", strenght: 8 },
    ];
    mockHeroService = jasmine.createSpyObj([
      "getHeroes",
      "addHero",
      "deleteHero",
    ]);
    TestBed.configureTestingModule({
      declarations: [HeroesComponent, HeroComponent, RouterLinkDirectiveStub],
      providers: [{ provide: HeroService, useValue: mockHeroService }],
      // schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HeroesComponent);
  });

  it("Should render each hero as a HeroComponent", () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));

    // Run ngOnInit
    fixture.detectChanges();

    const heroComponentsDEs = fixture.debugElement.queryAll(
      By.directive(HeroComponent)
    );
    expect(heroComponentsDEs.length).toEqual(3);
    for (let index = 0; index < HEROES.length; index++) {
      expect(heroComponentsDEs[index].componentInstance.hero).toEqual(
        HEROES[index]
      );
    }
  });

  it(`should call heroService.deleteHero when the Hero Component's delete button is clicked`, () => {
    spyOn(fixture.componentInstance, "delete");
    mockHeroService.getHeroes.and.returnValue(of(HEROES));

    // Run ngOnInit
    fixture.detectChanges();

    const heroComponents = fixture.debugElement.queryAll(
      By.directive(HeroComponent)
    );

    // (<HeroComponent>heroComponents[0].componentInstance).delete.emit(undefined);
    heroComponents[0].triggerEventHandler("delete", null);
    expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[0]);
  });

  it("should add a new hero to the hero list when the add button is clicked", () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    // Run ngOnInit
    fixture.detectChanges();

    const name = "Rorschach";

    mockHeroService.addHero.and.returnValue(
      of({ id: 5, name: name, strength: 500 })
    );
    const inputElement = fixture.debugElement.query(
      By.css("input")
    ).nativeElement;
    const addButton = fixture.debugElement.queryAll(By.css("button"))[0];

    inputElement.value = name;
    addButton.triggerEventHandler("click", null);

    fixture.detectChanges();
    const heroText = fixture.debugElement.query(By.css("ul")).nativeElement
      .textContent;
    expect(heroText).toContain(name);
  });

  it("should have the correct route for the first hero", () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    // Run ngOnInit
    fixture.detectChanges();
    const heroComponents = fixture.debugElement.queryAll(
      By.directive(HeroComponent)
    );
    let routerLink = heroComponents[1]
      .query(By.directive(RouterLinkDirectiveStub))
      .injector.get(RouterLinkDirectiveStub);

    heroComponents[1].query(By.css("a")).triggerEventHandler("click", null);

    expect(routerLink.navigatedTo).toBe("/detail/2");
  });
});
