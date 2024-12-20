package uwu.cookie.app;

import com.getcapacitor.BridgeActivity;
import app.xplatform.capacitor.plugins.AdMob;
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(AdMob.class);  // Add AdMob as a Capacitor Plugin
    }});
  }
}