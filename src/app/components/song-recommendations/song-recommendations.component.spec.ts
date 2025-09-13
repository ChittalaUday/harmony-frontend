import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongRecommendationsComponent } from './song-recommendations.component';

describe('SongRecommendationsComponent', () => {
  let component: SongRecommendationsComponent;
  let fixture: ComponentFixture<SongRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
